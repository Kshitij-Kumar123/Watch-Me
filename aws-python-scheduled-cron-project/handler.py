import datetime
import json
import logging
import boto3
import random
import os
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
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
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
            "subscribeStatus": "false"
        }
    )

    # TODO: Send email for confirmation and greeting

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

# Remove handlers which are not needed
def run(event, context):
    print("making a change")
    current_time = datetime.datetime.now().time()
    name = context.function_name
    for bucket in s3.buckets.all():
        logger.info(bucket.name)
        print(bucket.name)

    print("Your cron function " + name + " ran at " + str(current_time))
    logger.info("Your cron function " + name + " ran at " + str(current_time))


def get_posts(event, context):
    user_posts = get_file_contents('user-posts-dev-assets')
    body = {
        "posts": user_posts
    }

    print(body)
    return build_resp(body=body, content_type="text/html")


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

    return build_resp(body=selected_quote)

# TODO
def subscribe_user(event, context):
    post = "subscribe user"

    return build_resp(body={"post": post})


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


def static_mailer(event, context):
    post = "static_mailer"

    return build_resp(body={"post": post})

# TODO
def get_subscribers(event, context):
    post = "get subscribers"

    return build_resp(body={"post": post})
