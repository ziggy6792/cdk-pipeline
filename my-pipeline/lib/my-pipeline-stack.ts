import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { Construct, Stack, StackProps, Stage, StageProps, SecretValue } from '@aws-cdk/core';
import { CdkPipeline, SimpleSynthAction } from '@aws-cdk/pipelines';

import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';

// Your application
// May consist of one or more Stacks
//
// export class MyApplication extends Stage {
//   public readonly handler: lambda.Function;
//   constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id);

//     this.handler = new lambda.Function(this, 'TodoHandler', {
//       code: lambda.Code.fromAsset('lambda'),
//       handler: 'todoHandler.handler',
//       runtime: lambda.Runtime.NODEJS_12_X,
//       environment: {},
//     });
//   }
// }

export class LambdaStack extends Stack {
  public readonly handler: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    this.handler = new lambda.Function(this, 'TodoHandler', {
      code: lambda.Code.fromAsset('lambda'),
      handler: 'todoHandler.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {},
    });
  }
}

export class MyApplication extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const dbStack = new LambdaStack(this, 'Lambda');
  }
}

export class MyPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, 'Pipeline', {
      pipelineName: 'MyAppPipeline',
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager('GITHUB_OATH_TOKEN'),
        trigger: codepipeline_actions.GitHubTrigger.POLL,
        // Replace these with your actual GitHub project info
        owner: 'ziggy6792',
        repo: 'cdk-pipeline',
      }),

      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,

        // Use this if you need a build step (if you're not using ts-node
        // or if you have TypeScript Lambdas that need to be compiled).
        buildCommand: 'npm run build',
      }),
    });

    // Do this as many times as necessary with any account and region
    // Account and region may be different from the pipeline's.
    pipeline.addApplicationStage(
      new MyApplication(this, 'Dev', {
        env: {
          account: '694710432912',
          region: 'ap-southeast-1',
        },
      })
    );

    // Do this as many times as necessary with any account and region
    // Account and region may be different from the pipeline's.
    pipeline.addApplicationStage(
      new MyApplication(this, 'Prod', {
        env: {
          account: '694710432912',
          region: 'ap-southeast-1',
        },
      })
    );
  }
}
