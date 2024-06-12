import os

import boto3


def handler(event, context):
    dynamodb = boto3.resource('dynamodb',
                              region_name='us-east-1',
                              endpoint_url='http://172.17.0.3:4566')

    print("Table name: ", os.getenv('TABLE_NAME'))
    table = dynamodb.Table(os.getenv('TABLE_NAME'))


    table.put_item(
        Item={
            'id': '1202',
            'name': 'John Doe'
        }
    )
    return {
        'statusCode': 200,
        'body': 'Hello, World!'
    }
