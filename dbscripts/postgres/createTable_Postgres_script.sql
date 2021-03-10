--
-- Table structure for table noderegistry
--
CREATE TABLE IF NOT EXISTS noderegistry (
	id varchar(255) NOT NULL, -- primary key column
	host varchar(255) NULL,
	port varchar(255) NULL,
	state varchar(255) NULL,
	space varchar(255) NULL,
	name varchar(255) NULL,
	applicationGUID varchar(255) NULL,
	routingURL varchar(255) NULL,
	application_name varchar(255) NULL,
	product_version varchar(255) NULL,
    PRIMARY KEY (id)
);

--
-- Table structure for table process
--
--
-- Table structure for table process
--
CREATE TABLE IF NOT EXISTS process(
	id varchar(255) NULL,
	"nodeId" varchar(255) NULL,  -- foreign key column
	"appName" varchar(255) NULL,
	"appVersion" varchar(255) NULL,
	"moduleName" varchar(255) NULL,
	name varchar(255) NULL,
	"diagramConfigString" text NULL,
	source text NULL,
	CONSTRAINT process_nodeid_foreign FOREIGN KEY ("nodeId") REFERENCES noderegistry (id) 
	ON UPDATE NO ACTION 
	ON DELETE CASCADE
);


--
-- Table structure for table activityloggingstats
--
CREATE TABLE IF NOT EXISTS activityloggingstats(
	activityinstanceuid varchar(255) NOT NULL,   -- primary key column
	timestmp bigint NULL,
	applicationname varchar(255) NULL,
	applicationversion varchar(255) NULL,
	modulename varchar(255) NULL,
	moduleversion varchar(255) NULL,
	processname varchar(255) NULL,
	processinstanceid varchar(255) NULL,
	activityname varchar(255) NULL,
	activitystarttime bigint NULL,
	activitydurationtime bigint NULL,
	activityevaltime bigint NULL,
	activitystate varchar(255) NULL,
	domainname varchar(255) NULL,
	appspacename varchar(255) NULL,
	appnodename varchar(255) NULL,
	activityinput text NULL,
	activityoutput text NULL,
	activityexecutionid varchar(255) NULL,
	PRIMARY KEY (activityinstanceuid)
);

--
-- Table structure for table statregistry
--
CREATE TABLE IF NOT EXISTS statregistry(
	statuid varchar(255) NOT NULL,  -- primary key column
	status varchar(255) NULL,
	appname varchar(255) NULL,
	appversion varchar(255) NULL,
	space varchar(255) NULL,
	PRIMARY KEY (statuid)
);

--
-- Table structure for table processinstanceloggingstats
--
CREATE TABLE IF NOT EXISTS processinstanceloggingstats(
	processinstanceuid varchar(255) NOT NULL,  -- primary key column
	timestmp bigint NULL,
	applicationname varchar(255) NULL,
	applicationversion varchar(255) NULL,
	modulename varchar(255) NULL,
	moduleversion varchar(255) NULL,
	componentprocessname varchar(255) NULL,
	processinstancejobid varchar(255) NULL,
	parentprocessname varchar(255) NULL,
	parentprocessinstanceid varchar(255) NULL,
	processname varchar(255) NULL,
	processinstanceid varchar(255) NULL,
	processinstancestarttime bigint NULL,
	processinstanceendtime bigint NULL,
	processinstancedurationtime bigint NULL,
	processinstanceevaltime bigint NULL,
	processinstancestate varchar(255) NULL,
	domainname varchar(255) NULL,
	appspacename varchar(255) NULL,
	appnodename varchar(255) NULL,
	activityexecutionid varchar(255) NULL,
	PRIMARY KEY (processinstanceuid)
);

--
-- Table structure for table transitionloggingstats
--
CREATE TABLE IF NOT EXISTS transitionloggingstats(
	transitioninstanceuid varchar(255) NOT NULL,  -- primary key column
	timestmp bigint NULL,
	applicationname varchar(255) NULL,
	applicationversion varchar(255) NULL,
	modulename varchar(255) NULL,
	moduleversion varchar(255) NULL,
	componentprocessname varchar(255) NULL,
	processname varchar(255) NULL,
	processinstanceid varchar(255) NULL,
	transitionname varchar(255) NULL,
	domainname varchar(255) NULL,
	appspacename varchar(255) NULL,
	appnodename varchar(255) NULL,
	PRIMARY KEY (transitioninstanceuid)
);


