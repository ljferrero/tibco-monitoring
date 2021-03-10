/**
 * Created by bmane on 4/15/2017.
 */
var Store = require("jfs");
var db = new Store("node-registry", {
    type: 'single'
});
var statdb = new Store('stat-registry', {
    type: 'single'

})
module.exports = {nodedb:db , statdb:statdb};