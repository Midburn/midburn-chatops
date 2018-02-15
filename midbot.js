/* *****************************************************************************
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License")
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
********************************************************************************

This is a sample Slack bot built with Botkit.
*/

var Botkit = require('botkit');
var fs = require('fs');
var child_process = require('child_process');

// default to path inside the docker file
// for local development, set it to the midburn-k8s repo path, something like MIDBURN_K8S_PATH=/home/user/projects/midburn-k8s
var MIDBURN_K8S_PATH = process.env.MIDBURN_K8S_PATH ? process.env.MIDBURN_K8S_PATH : "/ops";

var PERMISSION_GROUPS = {
    // to add permissions, ask midbot "give me permissions"
    "superadmins": [
        "xxxx"  // Ori Hoch
    ]
    // TODO: add more granular permissions, e.g. permissions only to staging environment
};

var controller = Botkit.slackbot({debug: false});

if (!process.env.slack_token_path) {
    console.log('Error: Specify slack_token_path in environment')
    process.exit(1)
}

fs.readFile(process.env.slack_token_path, function (err, data) {
    if (err) {
        console.log('Error: Specify token in slack_token_path file')
        process.exit(1)
    }
    data = String(data)
    data = data.replace(/\s/g, '');
    controller
        .spawn({token: data})
        .startRTM(function (err) {
            if (err) {
                throw new Error(err)
            }
        })
});

// /**
//  * you say hello, and I say Meow
//  */
// controller.hears(
//   ['hello', 'hi'], ['direct_message', 'direct_mention', 'mention'],
//   function (bot, message) {
//       bot.reply(message, 'Meow. :smile_cat:')
//   });


/**
 * Allow users to ask for permissions on the bot
 */
controller.hears(
    ['give me permissions'], ['direct_message', 'direct_mention', 'mention'],
    function (bot, message) {
        bot.reply(message, "Midbot permissions are set in Midburn/midburn-chatops repository. \n" +
            "Please add your slack user id to the relevant permissions group: " + message.user)
    }
);

/**
 * Get list of pods
 */
controller.hears(
    ['get (production|staging) pods'], ['direct_message', 'direct_mention', 'mention'],
    function (bot, message) {
        var k8s_environment = message.match[1];
        console.log("Got request to get " + k8s_environment + " pods");
        if (check_environment_permissions(bot, message, k8s_environment)) {
            midburnK8S(k8s_environment, "kubectl get pods;", function (res) {
                bot.reply(message, res.stdout)
            });
        }
    }
);

/**
 * Execute script on a pod
 */
controller.hears(
    ['exec on (production|staging) pod (.*): (.*)'], ['direct_message', 'direct_mention', 'mention'],
    function (bot, message) {
        var k8s_environment = message.match[1];
        var pod_name = message.match[2];
        var exec_script = message.match[3];
        console.log("Got request to exec a script on " + k8s_environment + " pod " + pod_name);
        if (check_pod_permissions(bot, message, k8s_environment, pod_name)) {
            midburnK8S(k8s_environment, "kubectl exec " + pod_name + " " + exec_script, function (res) {
                bot.reply(message, res.stdout)
            });
        }
    }
);

/**
 * Deploy Spark
 */
// controller.hears([RegExp(/Deploy Spark (.*) v(.*)/i)], ['direct_message', 'direct_mention', 'mention'],
//     function (bot, message) {
//         var k8s_environment = message.match[1];
//         var deploy_version = message.match[2];
//         console.log("Got request to deploy spark " + deploy_version + " to " + k8s_environment + " environment");
//         if (PERMISSION_GROUPS.superadmins.indexOf(message.user) < 0) {
//             console.log("User " + message.user + " is not permitted to perform spark deployment to " + k8s_environment + " environment");
//             bot.reply(message, "Sorry, you are not allowed to perform this operation." +
//                 "You can ask midbot for permissions, just ask midbot 'give me permissions' (please would be nice)")
//         } else {
//             midburnK8S(k8s_environment, "kubectl get pods; echo " + deploy_version + ";", function (res) {
//                 bot.reply(message, res.stdout)
//             });
//         }
//     });


function midburnK8S(k8s_environment, script, cb) {
    console.log("executing script on " + k8s_environment + " environment...");
    child_process.exec(
        "( source switch_environment.sh " + k8s_environment + "; " + script + " ) 2>&1",
        {cwd: MIDBURN_K8S_PATH, shell: "bash"},
        function (err, stdout, stderr) {
            console.log("script completed, err=" + err);
            cb({"err": err, "stdout": stdout});
        }
    );
}

function check_pod_permissions(bot, message, k8s_environment, pod_name) {
    if (PERMISSION_GROUPS.superadmins.indexOf(message.user) < 0) {
        console.log("User " + message.user + " is not permitted to perform operations on " + k8s_environment + " pod " + pod_name);
        bot.reply(message, "Sorry, you are not allowed to perform this operation. \n" +
                           "You can ask midbot for permissions, just ask midbot 'give me permissions' (please would be nice)");
        return false;
    } else {
        return true;
    }
}

function check_environment_permissions(bot, message, k8s_environment) {
    if (PERMISSION_GROUPS.superadmins.indexOf(message.user) < 0) {
        console.log("User " + message.user + " is not permitted to perform operations on " + k8s_environment + " environment");
        bot.reply(message, "Sorry, you are not allowed to perform this operation. \n" +
                           "You can ask midbot for permissions, just ask midbot 'give me permissions' (please would be nice)");
        return false;
    } else {
        return true;
    }
}
