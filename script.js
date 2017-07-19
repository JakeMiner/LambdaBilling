var AWS = require('aws-sdk');
var cloudwatch = new AWS.CloudWatch({ region: 'us-east-1'});

exports.handler = (event, context, callback) => {
    var startTime = new Date(new Date().getTime() - (1000 * 60 * 60 * 4));
    var endTime = new Date();

    var params = {
        Period: 60,
        StartTime: startTime.toISOString(),
        EndTime: endTime.toISOString(),
        MetricName: 'EstimatedCharges',
        Namespace: 'AWS/Billing',
        Statistics: ['Maximum'],
        Dimensions: [{'Name':'Currency','Value':'USD'}]
    };
    cloudwatch.getMetricStatistics(params,function (err, data) {
        if (err) {
            console.log(err,err.stack);
        }
        if (data) {
            var sns = new AWS.SNS({region: 'us-east-1'});
            sns.publish({ Message: ' Current AWS Spend for Account Id 000000000000 is: $' + data['Datapoints'][0]['Maximum'],
                          TopicArn: 'arn:aws:sns:us-east-1:000000000000:BillingNotify'
            }, function(err, data) {
                if (err) {
                   console.log(err.stack);
                }
            });
        }
        console.log(data);
    });
    callback(null, 'Hello from Lambda');
};
