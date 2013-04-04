CREATE TABLE BPSS_PUSH_APPLICATION(
  id                             varchar(105)   NOT NULL,
  name                           varchar(80)    NOT NULL, 
  lower_name                     varchar(80)    NOT NULL,
  version                        varchar(10)    NOT NULL,  
  enterprise_username            varchar(42),
  bds_username                   varchar(42),
  public_password                varchar(96), 
  enterprise_password            varchar(96),
  bds_password                   varchar(96),
  description                    varchar(1024)  NOT NULL,  
  max_daily_quota                numeric(10)    UNSIGNED NOT NULL,
  status                         varchar(10)    NOT NULL,  
  push_port                      numeric(10)    UNSIGNED,
  public_notify_url              varchar(256),
  enterprise_notify_url          varchar(256),
  bds_notify_url                 varchar(256),
  store_push_requests			 char(1)        NOT NULL, 
  bypass_subscription            char(1)        NOT NULL,  
  start_date                     datetime       NOT NULL,
  expiry_date                    datetime       NOT NULL,
  created_date                   datetime       NOT NULL,
  modified_date                  datetime       NOT NULL,
  modified_by                    varchar(40)    NOT NULL,
  push_live_time				 numeric(10)    UNSIGNED NOT NULL,
  application_reliable           char(1)        NOT NULL,
  service_level            		 varchar(45)    NOT NULL,
  last_notification_enabled		 char(1)        NOT NULL,
  auto_delete_requests			 char(1)        NOT NULL,
  type					 		 varchar(40)    NOT NULL,
  CONSTRAINT bpss_pushapp_pk                    PRIMARY KEY(id),
  CONSTRAINT bpss_pushapp_lname_uk              UNIQUE (lower_name), 
  /*
   * Check constraints are still not yet supported by MySQL (they are effectively ignored).
   * They are provided here in case, in the future, MySQL adds support for them.
   */  
  CONSTRAINT bpss_pushapp_status_ck             CHECK (status='ACTIVE' OR status='INACTIVE'),
  CONSTRAINT bpss_pushapp_type_ck		        CHECK (type='Public Push' OR type='Enterprise Push' OR type='Public+Enterprise Push')
);

CREATE INDEX bpss_pushapp_name_index ON BPSS_PUSH_APPLICATION (name);
CREATE INDEX bpss_pushapp_status_index ON BPSS_PUSH_APPLICATION (status);
CREATE INDEX bpss_pushapp_type_index ON BPSS_PUSH_APPLICATION (type);

CREATE TABLE BPSS_PUSH_REQUEST(
  seq_num                      bigint		  UNSIGNED NOT NULL AUTO_INCREMENT,
  id                           varchar(96)    NOT NULL,
  push_app_id              	   varchar(105)   NOT NULL,
  delivery_method              varchar(24)    NOT NULL,
  expiry_date      			   datetime       NOT NULL, 
  bearer		               varchar(32),
  address_count                numeric(10)    UNSIGNED NOT NULL,
  content_size_bytes           numeric(38)    UNSIGNED NOT NULL,
  total_content_size_bytes     numeric(38)    UNSIGNED NOT NULL,
  created_date                 datetime       NOT NULL,
  modified_date                datetime       NOT NULL,
  public_notify_url            varchar(256),
  enterprise_notify_url        varchar(256),
  bds_notify_url               varchar(256),
  CONSTRAINT bpss_pr_pk                       PRIMARY KEY(seq_num),
  CONSTRAINT bpss_pr_uk                       UNIQUE(id),
  CONSTRAINT bpss_pr_appid_fk                 FOREIGN KEY (push_app_id) REFERENCES BPSS_PUSH_APPLICATION (id) ON DELETE CASCADE
);

CREATE INDEX bpss_pr_app_id_index ON BPSS_PUSH_REQUEST (push_app_id);
CREATE INDEX bpss_pr_created_index ON BPSS_PUSH_REQUEST (created_date);


CREATE TABLE BPSS_PUSH_REQUEST_DETAIL(
  seq_num                   bigint		  UNSIGNED NOT NULL AUTO_INCREMENT,
  id                        varchar(96)   NOT NULL,
  address                   varchar(40)   NOT NULL,
  subscriber_id             varchar(42),
  message_state             varchar(20)   DEFAULT 'pending' NOT NULL,
  status_code               varchar(16)   NOT NULL,
  status_desc               varchar(256),
  sender_name           	varchar(42),
  sender_address      		varchar(96),
  created_date              datetime      NOT NULL,
  completed_date            datetime,
  modified_date             datetime      NOT NULL,
  subscriber_type	   	    varchar(20)   NOT NULL,
  CONSTRAINT bpss_prd_pk                  PRIMARY KEY (seq_num),  
  CONSTRAINT bpss_prd_uk                  UNIQUE(id, address),
  CONSTRAINT bpss_prd_id_fk               FOREIGN KEY (id) REFERENCES BPSS_PUSH_REQUEST (id) ON DELETE CASCADE,
  /*
   * Check constraints are still not yet supported by MySQL (they are effectively ignored).
   * They are provided here in case, in the future, MySQL adds support for them.
   */     
  CONSTRAINT bpss_prd_subtype_ck		  CHECK (subscriber_type='PUBLIC' or subscriber_type='ENTERPRISE')
);

CREATE INDEX bpss_prd_id_index ON BPSS_PUSH_REQUEST_DETAIL (id);
CREATE INDEX bpss_prd_status_index ON BPSS_PUSH_REQUEST_DETAIL (status_code);
CREATE INDEX bpss_prd_address_index ON BPSS_PUSH_REQUEST_DETAIL (address);

CREATE TABLE BPSS_PUSH_COUNT(
  id                        varchar(96)		NOT NULL,
  completed_count			numeric(10)		NOT NULL,
  CONSTRAINT bpss_pc_pk						PRIMARY KEY (id),
  CONSTRAINT bpss_pc_id_fk					FOREIGN KEY (id) REFERENCES BPSS_PUSH_REQUEST (id) ON DELETE CASCADE 	
);

CREATE TABLE BPSS_PUSH_STATS(
  push_app_id              	varchar(105)   	NOT NULL,
  running_push_count		numeric(20)		NOT NULL,
  running_content_sum		numeric(20)		NOT NULL,
  daily_push_count			numeric(20)		NOT NULL,
  daily_push_count_date		datetime      	NOT NULL,
  CONSTRAINT bpss_ps_pk						PRIMARY KEY (push_app_id),
  CONSTRAINT bpss_ps_appid_fk				FOREIGN KEY (push_app_id) REFERENCES BPSS_PUSH_APPLICATION (id) ON DELETE CASCADE 	
);

CREATE TABLE BPSS_PUSH_SUBSCRIBER(
  seq_num                        bigint		    UNSIGNED NOT NULL AUTO_INCREMENT,
  id                             varchar(42)    NOT NULL,
  push_app_id                    varchar(105)   NOT NULL,
  address                        varchar(40)    NOT NULL,
  status                         varchar(10)    NOT NULL,
  os_version                     varchar(20),
  model                          varchar(20),
  subscribe_date                 datetime,
  unsubscribe_date               datetime,
  suspend_date                   datetime,
  resume_date                    datetime,
  type							 varchar(20)    NOT NULL,
  CONSTRAINT bpss_pushsub_pk                    PRIMARY KEY (seq_num),
  CONSTRAINT bpss_pushsub_aidsid_uk             UNIQUE (push_app_id, id),  
  CONSTRAINT bpss_pushsub_appid_fk              FOREIGN KEY (push_app_id) REFERENCES BPSS_PUSH_APPLICATION (id) ON DELETE CASCADE,
  /*
   * Check constraints are still not yet supported by MySQL (they are effectively ignored).
   * They are provided here in case, in the future, MySQL adds support for them.
   */   
  CONSTRAINT bpss_pushsub_status_ck             CHECK (status='ACTIVE' OR status='INACTIVE' OR status='SUSPENDED'),
  CONSTRAINT bpss_pushsub_type_ck				CHECK (type='PUBLIC' or type='ENTERPRISE')
);

CREATE INDEX bpss_pushsub_id_index ON BPSS_PUSH_SUBSCRIBER (id);
CREATE INDEX bpss_pushsub_appid_index ON BPSS_PUSH_SUBSCRIBER (push_app_id);
CREATE INDEX bpss_pushsub_status_index ON BPSS_PUSH_SUBSCRIBER (status);
CREATE INDEX bpss_pushsub_addr_index ON BPSS_PUSH_SUBSCRIBER (address);
CREATE INDEX bpss_pushsub_idstat_index ON BPSS_PUSH_SUBSCRIBER (id, status);
CREATE INDEX bpss_pushsub_aidstat_index ON BPSS_PUSH_SUBSCRIBER (push_app_id, status);
CREATE INDEX bpss_pushsub_aidaddr_index ON BPSS_PUSH_SUBSCRIBER (push_app_id, address);
CREATE INDEX bpss_pushsub_idaddr_index ON BPSS_PUSH_SUBSCRIBER (id, address);
CREATE INDEX bpss_pushsub_osver_index ON BPSS_PUSH_SUBSCRIBER (os_version);
CREATE INDEX bpss_pushsub_model_index ON BPSS_PUSH_SUBSCRIBER (model);
CREATE INDEX bpss_pushsub_aidtype_index ON BPSS_PUSH_SUBSCRIBER (push_app_id, type);
CREATE INDEX bpss_pushsub_aidtypestat_index ON BPSS_PUSH_SUBSCRIBER (push_app_id, type, status);

commit;
