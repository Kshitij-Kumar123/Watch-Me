import datetime
import json
import logging
import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

s3 = boto3.resource("s3")

# Format response in JSON


def return_resp(body, status_code=200):
    """Returns JSON response from Lambda."""
    response = {
        "statusCode": status_code,
        "Content-Type": "application/json",
        "body": json.dumps({
            body
        })
    }
    return response


def run(event, context):
    print("making a change")
    current_time = datetime.datetime.now().time()
    name = context.function_name
    for bucket in s3.buckets.all():
        logger.info(bucket.name)
        print(bucket.name)

    print("Your cron function " + name + " ran at " + str(current_time))
    logger.info("Your cron function " + name + " ran at " + str(current_time))


def get_quotes(event, context):
    post = "get quotes"

    return return_resp(body={"post": post})


def subscribe_user(event, context):
    post = "subscribe user"

    return return_resp(body={"post": post})


def static_mailer(event, context):
    post = "static mailer"

    return return_resp(body={"post": post})


def send_email(event, context):
    post = "send_email"

    return return_resp(body={"post": post})


def get_subscribers(event, context):
    post = "get subscribers"

    return return_resp(body={"post": post})
