'use strict';
const request = require('request');
const async = require('async');
const _ = require('lodash');

const REST_HEADER = {
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'User-Agent': 'bw6mon'
};

function getJobStats(host, port) {
    let baseUrl = `http://${host}:${port}/bw/statistics.json`;
    let requests = [
        'createdjobscount',
        'runningjobscount',
        'faultedjobscount',
        'pagedoutjobscount',
        'scheduledjobscount'
    ].reduce((accumulator, endpoint) => {
        accumulator[endpoint] = function (callback) {
            let options = {
                url: `${baseUrl}/${endpoint}`,
                method: 'GET',
                headers: REST_HEADER
            };
            request(options, (err, response, body) => {
                if (err) {
                    callback(err);
                } else if (response.statusCode != 200) {
                    callback(response.statusMessage);
                } else {
                    callback(null, body);
                }
            });
        };

        return accumulator;
    }, {});

    async.parallel(requests, (err, results) => {
        if (err) {
            return console.log(err);
        }
        console.log(results);
    });
}

getJobStats('localhost', 8060);
