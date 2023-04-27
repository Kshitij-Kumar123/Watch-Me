from datetime import datetime
import json
import logging
import boto3
import random
import os
import re
import uuid
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# TODO: push API and frontend to Prod
# TODO: add pictures and files to incidents
# TODO: Clean up files + CI/CD

# TODO: push SES to prod for emails: Remove Quotes email and create insights

# TODO: ChatGPT integration

# Format response in JSON


def build_resp(body, status_code=200, content_type="application/json"):
    """Returns JSON response from Lambda."""

    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps(body),
        "isBase64Encoded": False
    }


def pre_sign_up(event, context):
    # Adds new signed up user to database

    # User attrs
    # - user email
    # - user id for incidents
    # - role - admin, developer, customer
    # - name
    # - date created
    # - summary
    # - specialization
    # - applicable ACLs

    user_table = str(os.environ['USERS_TABLE'])
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(user_table)

    user_email = event["request"]["userAttributes"]["email"]
    cognito_id = event["request"]["userAttributes"]["sub"]

    current_date = datetime.now()
    iso_time_str = current_date.strftime('%Y-%m-%dT%H:%M:%S.%f%z')

    print(event)

    response = table.put_item(
        Item={
            'userId': cognito_id,
            'userEmail': user_email,  # temp
            'userRole': 'customer',  # should be userRole
            'name': "",
            "createdAt": iso_time_str,
            'summary': "",
            "user": {
                "allow": {
                    "/user/*": "GET",
                    f"/user/{cognito_id}": "PATCH"
                }
            },
            'incident': {
                "allow": {
                    "/incident": "POST",
                    f"/incident/reporter/{cognito_id}": "GET",
                }
            }
        }
    )

    # TODO: Send email for confirmation and greeting

    return event


def update_user_data(event, context):
    user_table = str(os.environ['USERS_TABLE'])

    db_client = boto3.resource('dynamodb')
    table = db_client.Table(user_table)
    user_id = event['pathParameters']['id']

    request_body = json.loads(event['body'])

    try:

        update_expression = "set "
        updated_attrs = {}
        count = 1
        last_key = list(request_body)[-1]

        for key, value in request_body.items():
            update_expression += f"info.{key}=:var{count}"
            updated_attrs[f':var{count}'] = value
            if key != last_key:
                update_expression += ", "
            count += 1

        print(update_expression)
        print(updated_attrs)

        response = table.update_item(
            Key={'userId': user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=updated_attrs,
            ReturnValues="UPDATED_NEW"
        )

    except ClientError as err:
        if err.response['Error']['Code'] == 'ValidationException':
            update_expression = "set "
            expression_attr_names = {}
            updated_attrs = {}
            count = 1
            last_key = list(request_body)[-1]

            for key, value in request_body.items():
                update_expression += f"#src{count}=:v{count}"
                updated_attrs[f':v{count}'] = value
                expression_attr_names[f"#src{count}"] = key

                if key != last_key:
                    update_expression += ", "
                count += 1

            print(update_expression)
            print(updated_attrs)
            print(expression_attr_names)

            response = table.update_item(
                Key={'userId': user_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=updated_attrs,
                ExpressionAttributeNames=expression_attr_names,
                ReturnValues="UPDATED_NEW"
            )

            # recipients = [request_body['reporter'], request_body['assignedTo']]
            # TODO: Email address is not verified. The following identities failed the check in region US-EAST-1:

            # generic_send_email(sender="kshitijkumar.atom@gmail.com",
            #                    subject=f"INCIDENT {incident_id}", body_html=create_email_body(f"INCIDENT {incident_id} updated by {request_body['assignedTo']}"), recipients=recipients)
            return build_resp(body=response['Attributes'])

        logger.error(
            "Couldn't update incident %s. Here's wh2y: %s: %s",
            user_id,
            err.response['Error']['Code'], err.response['Error']['Message'])
    else:
        # send email about update
        # recipients = [request_body['reporter'], request_body['assignedTo']]

        # generic_send_email(sender="kshitijkumar.atom@gmail.com",
        #                    subject=f"INCIDENT {incident_id}", body_html=create_email_body(f"INCIDENT {incident_id} updated"), recipients=recipients)

        return build_resp(body=response['Attributes'])


# Needs to be an admin only endpoint
def get_user_data(event, context):
    user_table = str(os.environ['USERS_TABLE'])

    db_client = boto3.resource('dynamodb')
    table = db_client.Table(user_table)
    user_id = event['pathParameters']['id']

    try:
        response = table.get_item(Key={
            'userId': user_id
        })

    except ClientError as err:
        logger.error(
            "Couldn't get incident %s. Here's w2y: %s: %s",
            user_id,
            err.response['Error']['Code'], err.response['Error']['Message'])

        return build_resp(body=err.response['Error']['Message'], status_code=err.response['Error']['Code'])
    else:
        item = response['Item']
        return build_resp(body=item)


def update_acl(event, context):
    user_table = str(os.environ['USERS_TABLE'])
    table = boto3.resource('dynamodb').Table(user_table)
    print(event['body'])
    event_body = json.loads(event['body'])
    user_email = event_body['userEmail']
    user_id = event_body['userId']
    user_acl = {}

    selected_user_role = event_body['role'].lower()
    # TODO: figure out role changes in DB

    if selected_user_role == "admin":
        if not "updatePermissions" in user_acl:
            user_acl['updatePermissions'] = {}

        if not 'incident' in user_acl:
            user_acl['incident'] = {}

        user_acl['updatePermissions'] = {
            "/updatePermissions": "POST",
        }

        user_acl['incident'] = {
            "/incident": "POST",
            "/incident/all": "GET",
            "/incident/*": "GET",
            f"/incident/reporter/*": "GET",
            f"/incident/developer/*": "GET",
            "/incident/update/*": "PATCH"
        }

    elif selected_user_role == "developer":
        if not 'incident' in user_acl:
            user_acl['incident'] = {}

        if not "updatePermissions" in user_acl:
            user_acl['updatePermissions'] = {}

        # user_acl['updatePermissions'] = {}
        user_acl['updatePermissions'] = {
            "/updatePermissions": "POST",
        }

        user_acl["incident"] = {
            "/incident": "POST",
            "/incident/all": "GET",
            "/incident/*": "GET",
            f"/incident/reporter/*": "GET",
            f"/incident/developer/{user_id}": "GET",
        }

    print("acl: ", user_acl)

    try:
        update_expression = "set info.userRole=:var0, "
        updated_attrs = {
            ':var0': selected_user_role
        }
        print("first if condition")

        # update_expression = "set "
        # updated_attrs = {}
        count = 1

        last_key = list(user_acl)[-1]

        for key, value in user_acl.items():
            update_expression += f"{key}.allow=:var{count}"
            updated_attrs[f':var{count}'] = value
            count += 1
            if key != last_key:
                update_expression += ", "

        response = table.update_item(
            Key={
                'userId': user_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=updated_attrs,
            ReturnValues="UPDATED_NEW"
        )
    except ClientError as err:

        if err.response['Error']['Code'] == 'ValidationException':
            update_expression = "set #src0=:var0, "
            expression_names = {
                "#src0": "userRole"
            }
            updated_attrs = {
                ":var0": selected_user_role
            }
            print("other if condition")

            # update_expression = "set "
            # expression_names = {}
            # updated_attrs = {}

            count = 1
            last_key = list(user_acl)[-1]
            for key, value in user_acl.items():
                update_expression += f"#src{count}=:var{count}"
                expression_names[f'#src{count}'] = key
                updated_attrs[f':var{count}'] = {"allow": value}
                count += 1
                if key != last_key:
                    update_expression += ", "

            print(update_expression)
            print(updated_attrs)
            print(expression_names)

            response = table.update_item(
                Key={
                    'userId': user_id
                },
                UpdateExpression=update_expression,
                ExpressionAttributeValues=updated_attrs,
                ExpressionAttributeNames=expression_names,
                ReturnValues="UPDATED_NEW"
            )

            logger.error(
                "Couldn't update user ACLs %s. Here's why: %s: %s",
                user_email,
                err.response['Error']['Code'], err.response['Error']['Message'])

        return build_resp(status_code=200, body={
            "message": f"{err.response['Error']['Code']}: {err.response['Error']['Message']}"
        })
    else:
        return build_resp(body=response['Attributes'])


def fetch_quotes_from_s3():
    s3 = boto3.resource('s3')
    quotes_file = s3.Object('quotesbucketinspiration', 'quotes.json')
    file_content = quotes_file.get()['Body'].read().decode('utf-8')
    json_content = json.loads(file_content)

    return json_content


def get_quotes(event, context):
    json_content = fetch_quotes_from_s3()
    quotes_max_index = len(json_content["quotes"]) - 1
    selected_quote_index = random.randint(0, quotes_max_index)
    selected_quote = json_content["quotes"][selected_quote_index]

    return build_resp(body={"quote": selected_quote, "event": event})


def create_email_body(body):
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
      
        <p>{body}</p>
      
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

# TODO: Push for AWS SES Prod


def generic_send_email(sender, recipients, subject, body_html, body_text=("Amazon SES Test (Python)\r\n"
                                                                          "This email was sent with Amazon SES using the "
                                                                          "AWS SDK for Python (Boto)."
                                                                          ), CHARSET="UTF-8"):

    # Create a new SES resource and specify a region.
    client = boto3.client('ses')

    # Try to send the email.
    try:
        # Provide the contents of the email.
        response = client.send_email(
            Destination={
                'ToAddresses': recipients,
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': CHARSET,
                        'Data': body_html,
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': body_text,
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': subject,
                },
            },
            Source=sender,
        )

    except ClientError as e:
        print(e.response['Error']['Message'])
        return build_resp(body={"message": e.response['Error']['Message']}, status_code=500)
    else:
        print("Email sent! Message ID:"),
        print(response['MessageId'])
        return build_resp(body={"message": f"Message successfully sent. {response['MessageId']}"})


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

    BODY_HTML = create_email_body(selected_quote["quote"])

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


def get_all_incidents(event, context):
    incidents_table = 'incident-tickets-table3-dev'
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(incidents_table)

    response = table.scan()
    data = response['Items']

    return build_resp(body=data)


def get_incidents(event, context):
    incidents_table = 'incident-tickets-table3-dev'
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(incidents_table)
    incident_id = event['pathParameters']['id']

    try:
        response = table.get_item(Key={
            'incidentId': incident_id
        })

    except ClientError as err:
        logger.error(
            "Couldn't get incident %s. Here's w2y: %s: %s",
            incident_id,
            err.response['Error']['Code'], err.response['Error']['Message'])

        return build_resp(body=err.response['Error']['Message'], status_code=err.response['Error']['Code'])
    else:
        item = response['Item']
        return build_resp(body=item)


def get_reporter_incidents(event, context):

    incidents_table = 'incident-tickets-table3-dev'
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(incidents_table)
    reporter_id = event['pathParameters']['id']

    try:
        response = table.query(
            IndexName='ReporterIdIndex',
            KeyConditionExpression=Key('reporterId').eq(reporter_id)
        )

    except ClientError as err:
        logger.error(
            "Couldn't get incident for user %s. 2Here's why: %s: %s",
            reporter_id,
            err.response['Error']['Code'], err.response['Error']['Message'])
        return build_resp(status_code=err.response['ResponseMetadata']['HTTPStatusCode'], body={
            "message": f"{err.response['Error']['Code']}: {err.response['Error']['Message']}"
        })
    else:
        item = response['Items']
        return build_resp(body=item)


def get_developer_incidents(event, context):

    incidents_table = 'incident-tickets-table3-dev'
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(incidents_table)
    developer_id = event['pathParameters']['id']

    try:
        response = table.query(
            IndexName='DeveloperIdIndex',
            KeyConditionExpression=Key('developerId').eq(
                developer_id)
        )

    except ClientError as err:
        logger.error(
            "Couldn't get incident for user %s. 2Here's why: %s: %s",
            developer_id,
            err.response['Error']['Code'], err.response['Error']['Message'])

        return build_resp(body=err.response['Error'], status_code=err.response['Error']['Code'])
    else:
        item = response['Items']
        return build_resp(body=item)


def create_incidents(event, context):
    # Primary key
    # pk: incident id
    # sk: 2dont need one

    # gs1
    # pk: reporter_id
    # sk: timestamp

    # gs2
    # pk: developer_id
    # sk: timestamp

    # create new incidents -- allowed to everyone logged in
    # - incident Id
    # - Re2porter
    # - AssignedTo
    # - Incident Status
    # - Title
    # - Summary
    # - Task Type
    # - task sub category type
    # - Attachments or Images
    # - Start and End date
    # - complexity rating + time put in
    # - Employee and user comments
    # - history tracking

    incidents_table = 'incident-tickets-table3-dev'
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(incidents_table)
    incident_id = str(uuid.uuid4())
    event_body = json.loads(event['body'])

    # TODO: update request body params

    try:
        current_date = datetime.now()
        iso_time_str = current_date.strftime('%Y-%m-%d %I:%M:%S %p')

        response = table.put_item(
            Item={
                "incidentId": incident_id,
                "reporterId": event_body['reporterId'],
                "developerId": event_body['developerId'],
                "timestamp": iso_time_str
            }
        )

    except ClientError as err:
        # TODO: fix the error message back
        print('this is error message: ', err.response)
        logger.error(
            "Couldn't create incident. Here's why: 2%s: %s",
            err.response['Error']['Code'], err.response['Error']['Message'])

        return build_resp(status_code=err.response['ResponseMetadata']['HTTPStatusCode'], body={
            "message": f"{err.response['Error']['Code']}: {err.response['Error']['Message']}"
        })
    else:
        # Update Reporter and Developer ACL

        if event_body['reporterId'] is not None:
            user_table = str(os.environ['USERS_TABLE'])
            table = db_client.Table(user_table)
            reporter_id = event_body['reporterId']
            response = table.get_item(Key={
                'userId': reporter_id
            })
            print(response)

            response['Item']['incident']['allow'][f'/incident/{incident_id}'] = 'GET'
            response['Item']['incident']['allow'][f'/incident/update/{incident_id}'] = 'PATCH'

            response = table.update_item(
                Key={'userId': reporter_id},
                UpdateExpression="set incident.allow=:var1",
                ExpressionAttributeValues={
                    ":var1": response['Item']['incident']['allow']
                },
                ReturnValues="UPDATED_NEW"
            )

        if event_body['developerId'] is not None:
            user_table = str(os.environ['USERS_TABLE'])
            table = db_client.Table(user_table)
            developer_id = event_body['developerId']
            response = table.get_item(Key={
                'userId': developer_id
            })
            print(response)

            response['Item']['incident']['allow'][f'/incident/{incident_id}'] = 'GET'
            response['Item']['incident']['allow'][f'/incident/update/{incident_id}'] = 'PATCH'

            response = table.update_item(
                Key={'userId': developer_id},
                UpdateExpression="set incident.allow=:var1",
                ExpressionAttributeValues={
                    ":var1": response['Item']['incident']['allow']
                },
                ReturnValues="UPDATED_NEW"
            )

        return build_resp(body={
            "incidentId": incident_id,
            "reporterId": event_body['reporterId'],
            "developerId": event_body['developerId'],
            "timestamp": iso_time_str
        })


def update_incidents(event, context):
    incidents_table = 'incident-tickets-table3-dev'
    db_client = boto3.resource('dynamodb')
    table = db_client.Table(incidents_table)
    incident_id = event['pathParameters']['id']

    request_body = json.loads(event['body'])

    try:

        update_expression = "set "
        updated_attrs = {}
        count = 1
        last_key = list(request_body)[-1]

        for key, value in request_body.items():
            update_expression += f"info.{key}=:var{count}"
            updated_attrs[f':var{count}'] = value
            if key != last_key:
                update_expression += ", "
            count += 1

        print(update_expression)
        print(updated_attrs)

        response = table.update_item(
            Key={'incidentId': incident_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=updated_attrs,
            ReturnValues="UPDATED_NEW"
        )

    except ClientError as err:
        if err.response['Error']['Code'] == 'ValidationException':
            update_expression = "set "
            expression_attr_names = {}
            updated_attrs = {}
            count = 1
            last_key = list(request_body)[-1]

            for key, value in request_body.items():
                update_expression += f"#src{count}=:v{count}"
                updated_attrs[f':v{count}'] = value
                expression_attr_names[f"#src{count}"] = key

                if key != last_key:
                    update_expression += ", "
                count += 1

            print(update_expression)
            print(updated_attrs)
            print(expression_attr_names)

            response = table.update_item(
                Key={'incidentId': incident_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=updated_attrs,
                ExpressionAttributeNames=expression_attr_names,
                ReturnValues="UPDATED_NEW"
            )

            # recipients = [request_body['reporter'], request_body['assignedTo']]
            # TODO: Email address is not verified. The following identities failed the check in region US-EAST-1:

            # generic_send_email(sender="kshitijkumar.atom@gmail.com",
            #                    subject=f"INCIDENT {incident_id}", body_html=create_email_body(f"INCIDENT {incident_id} updated by {request_body['assignedTo']}"), recipients=recipients)
            return build_resp(body=response['Attributes'])

        logger.error(
            "Couldn't update incident %s. Here's wh2y: %s: %s",
            incident_id,
            err.response['Error']['Code'], err.response['Error']['Message'])
    else:
        # send email about update
        # recipients = [request_body['reporter'], request_body['assignedTo']]

        # generic_send_email(sender="kshitijkumar.atom@gmail.com",
        #                    subject=f"INCIDENT {incident_id}", body_html=create_email_body(f"INCIDENT {incident_id} updated"), recipients=recipients)
        incident_resp = response

        if request_body['developerId'] is not None:
            user_table = str(os.environ['USERS_TABLE'])
            table = db_client.Table(user_table)
            developer_id = request_body['developerId']
            response = table.get_item(Key={
                'userId': developer_id
            })
            print(response)

            response['Item']['incident']['allow'][f'/incident/{incident_id}'] = 'GET'
            response['Item']['incident']['allow'][f'/incident/update/{incident_id}'] = 'PATCH'

            response = table.update_item(
                Key={'userId': developer_id},
                UpdateExpression="set incident.allow=:var1",
                ExpressionAttributeValues={
                    ":var1": response['Item']['incident']['allow']
                },
                ReturnValues="UPDATED_NEW"
            )
        return build_resp(body=incident_resp['Attributes'])


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
            "Couldn't delete incident %s. Here's wh2y: %s: %s",
            incident_id,
            err.response['Error']['Code'], err.response['Error']['Message'])
        raise
    else:
        return build_resp(body={"message": f"Incident deleted with ID: {incident_id}"})

# Authorization handlers


def authorization(event, context):
    token = event['authorizationToken']
    client = boto3.client('cognito-idp')
    response = client.get_user(AccessToken=token)
    principalId = response['UserAttributes'][0]['Value']
    emailId = response['UserAttributes'][2]['Value']

    awsAccountId = event['methodArn'].split(':')[4]
    # Configure your policy: restApiId, region, stage, etc.
    policy = AuthPolicy(principalId, awsAccountId)

    # Get rules from auth table
    user_table = str(os.environ['USERS_TABLE'])
    client = boto3.resource('dynamodb')
    table = client.Table(user_table)
    response = table.get_item(Key={'userId': principalId})

    print("principleId: ", principalId)
    print("emailId: ", emailId)
    print("table response: ", response)

    available_endpoints = ['incident', 'user', 'updatePermissions']

    for endpoint in available_endpoints:
        if endpoint in response['Item']:
            for k, v in response['Item'][endpoint]['allow'].items():
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
