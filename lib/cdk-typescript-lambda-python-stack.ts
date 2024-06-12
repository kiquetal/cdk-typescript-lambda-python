import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {PythonFunction, PythonLayerVersion} from '@aws-cdk/aws-lambda-python-alpha';
import * as path from "path";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {aws_apigateway, aws_apigatewayv2} from "aws-cdk-lib";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkTypescriptLambdaPythonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamoTable = new dynamodb.Table(this, 'external-idp-table-dynamo', {
        tableName: 'external-idps',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

    const layers = new PythonLayerVersion(this, 'external-idp-lambda-layer', {
        entry: path.join(__dirname, '..', 'lambda-layer', 'python'),
        bundling: {
            assetExcludes: ['.venv'],
        },
        compatibleRuntimes: [Runtime.PYTHON_3_10],
    });

     const lambda = new PythonFunction(this, 'external-idp-lambda', {
         functionName: 'external-idp-function',
        entry:  path.join(__dirname, '..', 'lambdas'),
        index: 'handler.py',
        handler: 'handler',
        runtime: Runtime.PYTHON_3_10,
        environment: {
            TABLE_NAME:'external-idps',
        },
     }  );

     const create_app_lambda = new PythonFunction(this, 'create-app-lambda', {
            functionName: 'create-app-function',
            entry: path.join(__dirname, '..', 'lambdas'),
            index: 'create_app.py',
            handler: 'handler',
            runtime: Runtime.PYTHON_3_10,
            environment: {
                TABLE_NAME: 'external-idps',
            },
        });

     const api = new aws_apigateway.RestApi(this, 'this-api', {
         restApiName: 'external-idp-api'
        });

     const externalApps = api.root.addResource("apps");
        externalApps.addMethod('GET', new aws_apigateway.LambdaIntegration(lambda));

      externalApps.addResource("{id}").addMethod('POST', new aws_apigateway.LambdaIntegration(create_app_lambda));
  }
}
