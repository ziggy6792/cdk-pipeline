#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MyPipelineStack } from '../lib/my-pipeline-stack';

const app = new cdk.App();
new MyPipelineStack(app, 'PipelineStack', {
  env: {
    account: '694710432912',
    region: 'ap-southeast-1',
  },
});

app.synth();
