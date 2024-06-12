import json

import boto3
def handler(event, context):

    body = event['body']
    obj = json.loads(body)
    print(body)
    my_body = {
        'name': 'John Doe',
        'from': obj['description']
    }
    return {
        'statusCode': 200,
        'body': json.dumps(my_body)
    }
