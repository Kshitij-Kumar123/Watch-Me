import datetime
import json
import logging
import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

s3 = boto3.resource("s3")

# Format response in JSON


def return_resp(body, status_code=200, content_type="application/json"):
    """Returns JSON response from Lambda."""
    return {
        "statusCode": status_code,
        "Content-Type": content_type,
        "body": body
    }


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


def run(event, context):
    print("making a change")
    current_time = datetime.datetime.now().time()
    name = context.function_name
    for bucket in s3.buckets.all():
        logger.info(bucket.name)
        print(bucket.name)

    print("Your cron function " + name + " ran at " + str(current_time))
    logger.info("Your cron function " + name + " ran at " + str(current_time))

# TODO: fix. This should be get posts not quotes...


def get_posts(event, context):
    user_posts = get_file_contents('user-posts-dev-assets')
    body = {
        "posts": user_posts
    }

    print(body)
    return return_resp(body=body, content_type="text/html")


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

# Testing...
# print(get_posts('', ''))
