import datetime
import json
import logging
import boto3
import random
import os
import re
import uuid
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

s3 = boto3.resource("s3")

# Format response in JSON


def build_resp(body, status_code=200, content_type="application/json"):
    """Returns JSON response from Lambda."""

    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            # 'Content-Type': 'application/json',
            # 'Access-Control-Allow-Origin': '*',
            # 'Access-Control-Allow-Methods': '*',
            # 'Access-Control-Allow-Credentials': '*'
        },
        'body': json.dumps(body),
        "isBase64Encoded": False
    }

# Rename functions


def pre_sign_up(event, context):

    db_client = boto3.resource('dynamodb')
    table = db_client.Table('watch-me-users-table-dev')

    new_user_id = event["request"]["userAttributes"]["email"]

    response = table.put_item(
        Item={
            'userId': new_user_id,
            "subscribeStatus": False,
            'incident': {
                "allow": {
                    "/incident/86f9d64d-2099-4664-8c7d-c759c667a844": "GET"
                }
            }
        }
    )

    # TODO: Send email for confirmation and greeting

    return event


def update_acl(event, context):
    # Read dynamoDB stream from paystub table
    for record in event['Records']:
        principalId = record['dynamodb']['Keys']['userId']['S']

        client = boto3.client('dynamodb')
        response = record['dynamodb']['NewImage']
        table = boto3.resource('dynamodb').Table('watch-me-users-table-dev')
        response = table.update_item(
            # Update acl table
            Key={
                'userId': principalId
            },
            UpdateExpression="set sendEmail.allow=:a",
            ExpressionAttributeValues={
                ":a": {
                    "/sendEmail": "POST"
                }
            },
        )

    return event


def get_file_contents(bucket):
    s3 = boto3.resource('s3')
    selected_bucket = s3.Bucket(bucket)

    file_contents = []

    for obj in selected_bucket.objects.all():
        body = obj.get()['Body'].read()
        filename = obj.key.split('/')[-1]
        content = {
            filename: body
        }
        file_contents.append(content)

    return file_contents


def fetch_quotes_from_s3():
    s3 = boto3.resource('s3')
    quotes_file = s3.Object('quotesbucketinspiration', 'quotes.json')
    file_content = quotes_file.get()['Body'].read().decode('utf-8')
    json_content = json.loads(file_content)

    return json_content


def get_quotes(event, context):
    print(event)
    json_content = fetch_quotes_from_s3()
    quotes_max_index = len(json_content["quotes"]) - 1
    selected_quote_index = random.randint(0, quotes_max_index)
    selected_quote = json_content["quotes"][selected_quote_index]

    return build_resp(body={"quote": selected_quote, "event": event})


def create_email(quote):
    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html lang="en">
   
    
    <body>
      <div class="container", style="min-height: 40vh;
      padding: 0 0.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;"> 
       <div class="card" style="margin-left: 20px;margin-right: 20px;">
          <div style="font-size: 14px;">
          <div class='card' style=" background: #f0c5c5;
          border-radius: 5px;
          padding: 1.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;">
      
        <p>{quote["quote"]}</p>
        <blockquote>by {quote["author"]}</blockquote>
      
    </div>
          <br>
          </div>
          
         
          <div class="footer-links" style="display: flex;justify-content: center;align-items: center;">
            <a href="/" style="text-decoration: none;margin: 8px;color: #9CA3AF;">Unsubscribe?</a>
            <a href="/" style="text-decoration: none;margin: 8px;color: #9CA3AF;">About Us</a>
         
          </div>
          </div>
      
            </div>
           
    </body>
    </html>"""


def send_email(event, context):
    # Replace sender@example.com with your "From" address.
    # This address must be verified with Amazon SES.
    SENDER = "Kshitij Kumar <kshitijkumar.atom@gmail.com>"

    # Replace recipient@example.com with a "To" address. If your account
    # is still in the sandbox, this address must be verified.
    RECIPIENT = "kshitijkumar.atom@gmail.com"

    # The subject line for the email.
    SUBJECT = "Daily Email"

    # The email body for recipients with non-HTML email clients.
    BODY_TEXT = ("Amazon SES Test (Python)\r\n"
                 "This email was sent with Amazon SES using the "
                 "AWS SDK for Python (Boto)."
                 )

    # The HTML body of the email.
    json_content = fetch_quotes_from_s3()
    file_len = len(json_content["quotes"]) - 1
    selected_quote_index = random.randint(0, file_len)
    selected_quote = json_content["quotes"][selected_quote_index]

    BODY_HTML = create_email(selected_quote)

    # The character encoding for the email.
    CHARSET = "UTF-8"

    # Create a new SES resource and specify a region.
    client = boto3.client('ses')

    # Try to send the email.
    try:
        # Provide the contents of the email.
        response = client.send_email(
            Destination={
                'ToAddresses': [
                    RECIPIENT,
                ],
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': CHARSET,
                        'Data': BODY_HTML,
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': BODY_TEXT,
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': SUBJECT,
                },
            },
            Source=SENDER,
        )

    except ClientError as e:
        print(e.response['Error']['Message'])
        return build_resp(body={"message": e.response['Error']['Message']}, status_code=500)

    else:
        print("Email sent! Message ID:"),
        print(response['MessageId'])
        return build_resp(body={"message": f"Message successfully sent. {response['MessageId']}"})


# TODO
# CRUD with incidents -- v1 done
# Add authorization and endpoint restriction for such incidents --
# Send emails to users to info they are subscribed to: insight emails about ticket with quote
# ask gpt?? quick feature??

def get_incidents(event, context):
    # Get all subscribers of the incident by pkey (id) and/or skey (active)
    incidents_table = str(os.environ['INCIDENTS_TABLE'])
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(incidents_table)
    incident_id = event['pathParameters']['id']

    try:
        response = table.get_item(Key={
            'incidentId': event['pathParameters']['id']
        })

    except ClientError as err:
        logger.error(
            "Couldn't get incident %s. Here's why: %s: %s",
            incident_id,
            err.response['Error']['Code'], err.response['Error']['Message'])
        return build_resp(body=err.response['Error'])
    else:
        item = response['Item']
        return build_resp(body=item)


def create_incidents(event, context):
    incidents_table = str(os.environ['INCIDENTS_TABLE'])
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(incidents_table)
    incident_id = str(uuid.uuid4())

    try:
        response = table.put_item(
            Item={
                "incidentId": incident_id,
                "reporter": "example"
            }
        )
    except ClientError as err:
        logger.error(
            "Couldn't create incident. Here's why: %s: %s",
            err.response['Error']['Code'], err.response['Error']['Message'])
        raise
    else:
        return build_resp(body={
            "incidentId": incident_id,
            "reporter": "example"
        })


def update_incidents(event, context):
    incidents_table = str(os.environ['INCIDENTS_TABLE'])
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(incidents_table)
    incident_id = event['pathParameters']['id']

    try:
        response = table.update_item(
            Key={'incidentId': incident_id},
            UpdateExpression="set info.incidentStatus=:s",
            ExpressionAttributeValues={
                ":s": "complete"
            },
            ReturnValues="UPDATED_NEW"
        )
    except ClientError as err:
        if err.response['Error']['Code'] == 'ValidationException':
            response = table.update_item(
                Key={'incidentId': incident_id},
                UpdateExpression="set incidentStatus = :incidentStatus",
                ExpressionAttributeValues={
                    ':incidentStatus': {
                        ':c': "complete"
                    }
                },
                ReturnValues="UPDATED_NEW"
            )

            return build_resp(body=response['Attributes'])

        logger.error(
            "Couldn't update incident %s. Here's why: %s: %s",
            incident_id,
            err.response['Error']['Code'], err.response['Error']['Message'])
        raise
    else:
        return build_resp(body=response['Attributes'])


def delete_incidents(event, context):
    incidents_table = str(os.environ['INCIDENTS_TABLE'])
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(incidents_table)
    incident_id = event['pathParameters']['id']

    try:
        response = table.delete_item(Key={
            'incidentId': event['pathParameters']['id']
        })
    except ClientError as err:
        logger.error(
            "Couldn't delete incident %s. Here's why: %s: %s",
            incident_id,
            err.response['Error']['Code'], err.response['Error']['Message'])
        raise
    else:
        return build_resp(body={"message": f"Incident deleted with ID: {incident_id}"})


def subscribe_user(event, context):
    post = "subscribe user"

    return build_resp(body={"post": post})


def get_subscribers(event, context):
    post = "get subscribers"

    return build_resp(body={"post": post})


# Authorization handlers

def authorization(event, context):
    logger.info(event)
    print(event)
    token = event['authorizationToken']
    client = boto3.client('cognito-idp')
    response = client.get_user(AccessToken=token)
    print("user response: ", response)
    # get user email for now --- TODO: will do uuid later
    principalId = response['UserAttributes'][0]['Value']
    emailId = response['UserAttributes'][2]['Value']

    awsAccountId = event['methodArn'].split(':')[4]
    # Configure your policy: restApiId, region, stage, etc.
    policy = AuthPolicy(principalId, awsAccountId)

    # Get rules from auth table
    client = boto3.resource('dynamodb')
    table = client.Table('watch-me-users-table-dev')
    response = table.get_item(Key={'userId': emailId})
    # Add your rules to policy here
    # example:
    print("principleId: ", principalId)
    print("emailId: ", emailId)
    print("table response: ", response)
    for k, v in response['Item']['incident']['allow'].items():
        # policy.allowMethod(v['S'], k)
        # if k == 'incident':
            # ??
        # for k, v in v['allow']['M'].items():
        policy.allowMethod(v, k)

    # Build policy
    authResponse = policy.build()
    return authResponse


class HttpVerb:
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    HEAD = "HEAD"
    DELETE = "DELETE"
    OPTIONS = "OPTIONS"
    ALL = "*"


class AuthPolicy(object):
    awsAccountId = ""
    principalId = ""
    version = "2012-10-17"
    pathRegex = "^[/.a-zA-Z0-9-\*]+$"
    allowMethods = []
    denyMethods = []

    restApiId = "*"
    region = "*"
    stage = "*"

    def __init__(self, principal, awsAccountId):
        self.awsAccountId = awsAccountId
        self.principalId = principal
        self.allowMethods = []
        self.denyMethods = []

    def _addMethod(self, effect, verb, resource, conditions):
        if verb != "*" and not hasattr(HttpVerb, verb):
            raise NameError("Invalid HTTP verb " + verb +
                            ". Allowed verbs in HttpVerb class")
        resourcePattern = re.compile(self.pathRegex)
        if not resourcePattern.match(resource):
            raise NameError("Invalid resource path: " + resource +
                            ". Path should match " + self.pathRegex)

        if resource[:1] == "/":
            resource = resource[1:]

        resourceArn = ("arn:aws:execute-api:" +
                       self.region + ":" +
                       self.awsAccountId + ":" +
                       self.restApiId + "/" +
                       self.stage + "/" +
                       verb + "/" +
                       resource)

        if effect.lower() == "allow":
            self.allowMethods.append({
                'resourceArn': resourceArn,
                'conditions': conditions
            })
        elif effect.lower() == "deny":
            self.denyMethods.append({
                'resourceArn': resourceArn,
                'conditions': conditions
            })

    def _getEmptyStatement(self, effect):
        statement = {
            'Action': 'execute-api:Invoke',
            'Effect': effect[:1].upper() + effect[1:].lower(),
            'Resource': []
        }

        return statement

    def _getStatementForEffect(self, effect, methods):
        statements = []

        if len(methods) > 0:
            statement = self._getEmptyStatement(effect)

            for curMethod in methods:
                if curMethod['conditions'] is None or len(curMethod['conditions']) == 0:
                    statement['Resource'].append(curMethod['resourceArn'])
                else:
                    conditionalStatement = self._getEmptyStatement(effect)
                    conditionalStatement['Resource'].append(
                        curMethod['resourceArn'])
                    conditionalStatement['Condition'] = curMethod['conditions']
                    statements.append(conditionalStatement)

            statements.append(statement)

        return statements

    def allowAllMethods(self):
        self._addMethod("Allow", HttpVerb.ALL, "*", [])

    def denyAllMethods(self):
        self._addMethod("Deny", HttpVerb.ALL, "*", [])

    def allowMethod(self, verb, resource):
        self._addMethod("Allow", verb, resource, [])

    def denyMethod(self, verb, resource):
        self._addMethod("Deny", verb, resource, [])

    def allowMethodWithConditions(self, verb, resource, conditions):
        self._addMethod("Allow", verb, resource, conditions)

    def denyMethodWithConditions(self, verb, resource, conditions):
        self._addMethod("Deny", verb, resource, conditions)

    def build(self):
        if ((self.allowMethods is None or len(self.allowMethods) == 0) and
                (self.denyMethods is None or len(self.denyMethods) == 0)):
            raise NameError("No statements defined for the policy")

        policy = {
            'principalId': self.principalId,
            'policyDocument': {
                'Version': self.version,
                'Statement': []
            }
        }

        policy['policyDocument']['Statement'].extend(
            self._getStatementForEffect("Allow", self.allowMethods))
        policy['policyDocument']['Statement'].extend(
            self._getStatementForEffect("Deny", self.denyMethods))

        return policy
