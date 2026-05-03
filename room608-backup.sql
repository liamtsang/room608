PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE `users_sessions` (
  	`_order` integer NOT NULL,
  	`_parent_id` integer NOT NULL,
  	`id` text PRIMARY KEY NOT NULL,
  	`created_at` text,
  	`expires_at` text NOT NULL,
  	FOREIGN KEY (`_parent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
  );
INSERT INTO "users_sessions" ("_order","_parent_id","id","created_at","expires_at") VALUES(1,1,'fb67c1b1-7029-431e-a5c0-50fb1a2e0e67','2026-04-23T20:10:46.298Z','2026-04-23T22:10:46.298Z');
CREATE TABLE `users` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`email` text NOT NULL,
  	`reset_password_token` text,
  	`reset_password_expiration` text,
  	`salt` text,
  	`hash` text,
  	`login_attempts` numeric DEFAULT 0,
  	`lock_until` text
  );
INSERT INTO "users" ("id","updated_at","created_at","email","reset_password_token","reset_password_expiration","salt","hash","login_attempts","lock_until") VALUES(1,'2026-03-25T18:11:34.811Z','2026-02-28T22:56:37.929Z','admin@admin.com',NULL,NULL,'04b68163629ea6251890cb39b92674b0119c89f9c33e64fd3444e9e5a3b9874f','385d77fb8851bdc9e86014f21f93ab5060d6b8e594d41cb7b028e32b5115be1e07324726f6172ae858f3ff65e57f3cad875da00aca7d4241327459980e9f4f20100194ca9785ed839178be5404a12f0d0fe76c0b9cc6d4a966c3c3018cf1cb00d59b029aff90e4814af6a6530ca2161742140afc6cb5169dcf9a106575205c99f0a2558fca5a73c60ffc9e1deb365fd3dace153468ae11a116d9ada810ca2dfb93e65af9839de702456dc4259aee943099d5b14b11615efbaaccd1902269e3801fc1067f2614c6f36ed844f6fea369cbf4ee9f11998137bacd144be370f059f2d60a4ea162e400532504e5754774248d8449ac6f4c44ea57698183bef185dd875b42769548c543e5d05d967ccf943673972f8b51f4d15730cc7701222138a77ece81bb4257fe458f660c484000977aeca90b42f0e334f1a1af5455089c22babdf1c638ea78a31648f106b3fd38f86cad89d96e55cbe197fb2664f138bebddd46087e5a6f990fefaba9227b1988a0621628c9552fc3ed3b03a3ca959e5a165802849595353a2a786c42f10c55e2f1e4190368ac93ba9143b6dbedb82bb091dceaa7d6b4531a9dbb37f862a300ce62d0c16cc138b48450de4aeec421dd29e72ec5e929f194cdaec723b9ef24f72fcefccb8e037a80ab36225f8e3d9197c6d1a8081b0eccffbac26c4b6150c12c9ed93df607e4b8800aff6dd6ee134953a394b4e4',0,NULL);
CREATE TABLE `media` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`alt` text NOT NULL,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`url` text,
  	`thumbnail_u_r_l` text,
  	`filename` text,
  	`mime_type` text,
  	`filesize` numeric,
  	`width` numeric,
  	`height` numeric
  );
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(1,'breaking the deadlock frame','2026-02-28T23:03:42.313Z','2026-02-28T23:03:42.313Z','/api/media/file/image-asset.webp',NULL,'image-asset.webp','image/webp',1268428,1920,1080);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(2,'breaking the deadlock frame','2026-02-28T23:04:08.648Z','2026-02-28T23:04:08.648Z','/api/media/file/image-asset%20(1).webp',NULL,'image-asset (1).webp','image/webp',850940,1920,1080);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(3,'breaking the deadlock frame','2026-02-28T23:04:16.180Z','2026-02-28T23:04:16.180Z','/api/media/file/image-asset%20(2).webp',NULL,'image-asset (2).webp','image/webp',1142068,1920,1080);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(4,'a trip to infinity frame','2026-02-28T23:06:36.385Z','2026-02-28T23:06:36.385Z','/api/media/file/infinity%2B01%2Bhi%2Bres.webp',NULL,'infinity+01+hi+res.webp','image/webp',1007564,1920,1012);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(5,'a trip to infinity frame','2026-02-28T23:06:44.723Z','2026-02-28T23:06:44.723Z','/api/media/file/infinity%2B09%2Bhi%2Bres.webp',NULL,'infinity+09+hi+res.webp','image/webp',578694,1920,1012);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(6,'a trip to infinity frame','2026-02-28T23:06:50.790Z','2026-02-28T23:06:50.790Z','/api/media/file/infinity%2B11%2Bhi%2Bres.webp',NULL,'infinity+11+hi+res.webp','image/webp',2198306,1920,1012);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(7,'hopwia frame 1','2026-03-25T18:15:49.594Z','2026-03-25T18:15:49.594Z','/api/media/file/howpia_01.png',NULL,'howpia_01.png','image/png',76662,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(8,'hopwia frame 2','2026-03-25T18:16:24.338Z','2026-03-25T18:16:24.338Z','/api/media/file/howpia_02.png',NULL,'howpia_02.png','image/png',72220,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(9,'hopwia frame 3','2026-03-25T18:16:24.688Z','2026-03-25T18:16:24.688Z','/api/media/file/howpia_03.png',NULL,'howpia_03.png','image/png',61186,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(10,'decoding watson frame 2','2026-03-25T18:16:25.023Z','2026-03-25T18:16:25.023Z','/api/media/file/decoding_watson_02.png',NULL,'decoding_watson_02.png','image/png',61420,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(11,'decoding watson frame 1','2026-03-25T18:16:25.336Z','2026-03-25T18:16:25.336Z','/api/media/file/decoding_watson_01.png',NULL,'decoding_watson_01.png','image/png',77838,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(12,'decoding watson frame 3','2026-03-25T18:16:25.646Z','2026-03-25T18:16:25.646Z','/api/media/file/decoding_watson_03.png',NULL,'decoding_watson_03.png','image/png',24252,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(13,'hedspace frame','2026-03-25T18:16:26.063Z','2026-03-25T18:16:26.063Z','/api/media/file/headspace%2B06%2Bhi%2Bres.png',NULL,'headspace+06+hi+res.png','image/png',792580,1280,720);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(14,'hedspace frame','2026-03-25T18:16:26.527Z','2026-03-25T18:16:26.527Z','/api/media/file/headspace%2B04%2Bhi%2Bres.png',NULL,'headspace+04+hi+res.png','image/png',203280,1280,720);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(15,'hedspace frame','2026-03-25T18:16:26.988Z','2026-03-25T18:16:26.988Z','/api/media/file/headspace%2B01%2Bhi%2Bres.png',NULL,'headspace+01+hi+res.png','image/png',510584,1280,720);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(16,'fauci frame','2026-03-25T18:16:27.478Z','2026-03-25T18:16:27.478Z','/api/media/file/fauci%2B06%2Bhi%2Bres.png',NULL,'fauci+06+hi+res.png','image/png',849686,1920,1080);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(17,'fauci frame','2026-03-25T18:16:27.848Z','2026-03-25T18:16:27.848Z','/api/media/file/fauci%2B03%2Bhi%2Bres.jpg',NULL,'fauci+03+hi+res.jpg','image/jpeg',90536,1920,1080);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(18,'fauci frame','2026-03-25T18:16:28.385Z','2026-03-25T18:16:28.385Z','/api/media/file/fauci%2B05%2Bhi%2Bres.png',NULL,'fauci+05+hi+res.png','image/png',597098,1920,1080);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(19,'headspace frame','2026-04-21T17:42:40.702Z','2026-04-21T17:42:40.702Z','/api/media/file/headspace%2B01%2Bhi%2Bres.webp',NULL,'headspace+01+hi+res.webp','image/webp',510584,1280,720);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(20,'headspace frame 2','2026-04-21T17:42:52.357Z','2026-04-21T17:42:52.357Z','/api/media/file/headspace%2B04%2Bhi%2Bres-1.png',NULL,'headspace+04+hi+res-1.png','image/png',203280,1280,720);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(21,'headspace frame 3','2026-04-21T17:43:01.858Z','2026-04-21T17:43:01.858Z','/api/media/file/headspace%2B06%2Bhi%2Bres-1.png',NULL,'headspace+06+hi+res-1.png','image/png',792580,1280,720);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(22,'decoding watson frame 1','2026-04-21T17:44:00.204Z','2026-04-21T17:44:00.204Z','/api/media/file/decoding_watson_01-1.png',NULL,'decoding_watson_01-1.png','image/png',77838,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(23,'decoding watson frame 2','2026-04-21T17:44:07.892Z','2026-04-21T17:44:07.892Z','/api/media/file/decoding_watson_02-1.png',NULL,'decoding_watson_02-1.png','image/png',61420,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(24,'decoding watson frame 3','2026-04-21T17:44:15.127Z','2026-04-21T17:44:15.127Z','/api/media/file/decoding_watson_03-1.png',NULL,'decoding_watson_03-1.png','image/png',24252,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(25,'the history of white people in america frame 1','2026-04-21T17:46:01.176Z','2026-04-21T17:46:01.176Z','/api/media/file/howpia_01.webp',NULL,'howpia_01.webp','image/webp',76662,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(26,'the history of white people in america frame 2','2026-04-21T17:46:08.765Z','2026-04-21T17:46:08.765Z','/api/media/file/howpia_02.webp',NULL,'howpia_02.webp','image/webp',72220,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(27,'the history of white people in america frame 3','2026-04-21T17:46:16.353Z','2026-04-21T17:46:16.353Z','/api/media/file/howpia_03.webp',NULL,'howpia_03.webp','image/webp',61186,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(28,'beyond a year in space frame 1','2026-04-21T17:47:19.390Z','2026-04-21T17:47:19.390Z','/api/media/file/beyond-a-year-in-space-thm-01.jpg',NULL,'beyond-a-year-in-space-thm-01.jpg','image/jpeg',11670,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(29,'beyond a year in space frame 2','2026-04-21T17:47:26.587Z','2026-04-21T17:47:26.587Z','/api/media/file/beyond-a-year-in-space-thm-02.webp',NULL,'beyond-a-year-in-space-thm-02.webp','image/webp',6236,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(30,'beyond a year in space frame 3','2026-04-21T17:47:35.444Z','2026-04-21T17:47:35.444Z','/api/media/file/beyond-a-year-in-space-thm-03.webp',NULL,'beyond-a-year-in-space-thm-03.webp','image/webp',18958,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(31,'a year in space frame 1','2026-04-21T17:49:04.177Z','2026-04-21T17:49:04.177Z','/api/media/file/a-year-in-space-thm-01.webp',NULL,'a-year-in-space-thm-01.webp','image/webp',13940,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(32,'a year in space frame 2','2026-04-21T17:49:11.553Z','2026-04-21T17:49:11.553Z','/api/media/file/image-asset-1.webp',NULL,'image-asset-1.webp','image/webp',16290,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(33,'a year in space frame 3','2026-04-21T17:49:32.466Z','2026-04-21T17:49:32.466Z','/api/media/file/image-asset-2.webp',NULL,'image-asset-2.webp','image/webp',2904,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(34,'faces of death 1','2026-04-21T17:51:43.172Z','2026-04-21T17:51:43.172Z','/api/media/file/faces%20of%20death%201.webp',NULL,'faces of death 1.webp','image/webp',7222,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(35,'faces of death 2','2026-04-21T17:51:51.147Z','2026-04-21T17:51:51.147Z','/api/media/file/faces%20of%20death%202.webp',NULL,'faces of death 2.webp','image/webp',11288,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(36,'faces of death 3','2026-04-21T17:51:57.349Z','2026-04-21T17:51:57.349Z','/api/media/file/faces-of-death-thm-03.webp',NULL,'faces-of-death-thm-03.webp','image/webp',5408,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(37,'the day the 60s died frame 1','2026-04-23T20:54:22.042Z','2026-04-23T20:54:22.042Z','/api/media/file/Shooting%2B310px%2Bwide.webp',NULL,'Shooting+310px+wide.webp','image/webp',26890,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(38,'the day the 60s died frame 2','2026-04-23T20:54:29.342Z','2026-04-23T20:54:29.342Z','/api/media/file/Girl%2Bwith%2Bhand%2B310px%2Bwide.webp',NULL,'Girl+with+hand+310px+wide.webp','image/webp',23734,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(39,'the day the 60s died frame 3','2026-04-23T20:54:35.558Z','2026-04-23T20:54:35.558Z','/api/media/file/Nixon%2Bwith%2BStudents_310px%2Bwide.webp',NULL,'Nixon+with+Students_310px+wide.webp','image/webp',20092,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(40,'times square time machine','2026-04-23T20:56:13.103Z','2026-04-23T20:56:13.103Z','/api/media/file/tstm-thm-01.webp',NULL,'tstm-thm-01.webp','image/webp',9896,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(41,'times square time machine','2026-04-23T20:56:18.667Z','2026-04-23T20:56:18.667Z','/api/media/file/tstm-thm-02.webp',NULL,'tstm-thm-02.webp','image/webp',17044,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(42,'times square time machine','2026-04-23T20:56:24.323Z','2026-04-23T20:56:24.323Z','/api/media/file/tstm-thm-03.webp',NULL,'tstm-thm-03.webp','image/webp',10156,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(43,'curious frame','2026-04-23T20:57:25.711Z','2026-04-23T20:57:25.711Z','/api/media/file/curious1.webp',NULL,'curious1.webp','image/webp',69380,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(44,'curious frame','2026-04-23T20:57:31.035Z','2026-04-23T20:57:31.035Z','/api/media/file/Curious2.webp',NULL,'Curious2.webp','image/webp',55186,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(45,'curious frame','2026-04-23T20:57:35.995Z','2026-04-23T20:57:35.995Z','/api/media/file/Curious3.webp',NULL,'Curious3.webp','image/webp',33700,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(46,'the cave frame','2026-04-23T20:58:49.249Z','2026-04-23T20:58:49.249Z','/api/media/file/MEXICO_CURIOSITYCAVE_strip1_310.webp',NULL,'MEXICO_CURIOSITYCAVE_strip1_310.webp','image/webp',79146,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(47,'the cave frame','2026-04-23T20:58:54.903Z','2026-04-23T20:58:54.903Z','/api/media/file/strip%2B3_310.webp',NULL,'strip+3_310.webp','image/webp',68742,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(48,'the cave frame','2026-04-23T20:58:59.476Z','2026-04-23T20:58:59.476Z','/api/media/file/strip%2B2_310.webp',NULL,'strip+2_310.webp','image/webp',70324,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(49,'buried in burma frame','2026-04-23T21:00:18.742Z','2026-04-23T21:00:18.742Z','/api/media/file/burma1.webp',NULL,'burma1.webp','image/webp',22336,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(50,'buried in burma frame','2026-04-23T21:00:23.630Z','2026-04-23T21:00:23.630Z','/api/media/file/burma2.webp',NULL,'burma2.webp','image/webp',24574,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(51,'buried in burma frame','2026-04-23T21:00:28.837Z','2026-04-23T21:00:28.837Z','/api/media/file/burma3.webp',NULL,'burma3.webp','image/webp',13540,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(52,'Turning Science Into Cures - The Jackson Laboratory frame','2026-04-23T21:01:25.039Z','2026-04-23T21:01:25.039Z','/api/media/file/jax-thm-01.webp',NULL,'jax-thm-01.webp','image/webp',28622,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(53,'Turning Science Into Cures - The Jackson Laboratory frame','2026-04-23T21:01:30.798Z','2026-04-23T21:01:30.798Z','/api/media/file/jax-thm-02a.webp',NULL,'jax-thm-02a.webp','image/webp',3574,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(54,'Turning Science Into Cures - The Jackson Laboratory frame','2026-04-23T21:01:36.222Z','2026-04-23T21:01:36.222Z','/api/media/file/jax-thm-03.webp',NULL,'jax-thm-03.webp','image/webp',17696,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(55,'inside death row frame','2026-04-23T21:02:41.754Z','2026-04-23T21:02:41.754Z','/api/media/file/DEATHROW1.webp',NULL,'DEATHROW1.webp','image/webp',78910,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(56,'inside death row frame','2026-04-23T21:02:48.752Z','2026-04-23T21:02:48.752Z','/api/media/file/DEATHROW2.webp',NULL,'DEATHROW2.webp','image/webp',79968,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(57,'inside death row frame','2026-04-23T21:02:53.217Z','2026-04-23T21:02:53.217Z','/api/media/file/DEATHROW3.webp',NULL,'DEATHROW3.webp','image/webp',48320,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(58,'how to build a beating heart frame','2026-04-23T21:04:33.637Z','2026-04-23T21:04:33.637Z','/api/media/file/BEATINGHEART1.webp',NULL,'BEATINGHEART1.webp','image/webp',90766,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(59,'how to build a beating heart frame','2026-04-23T21:04:39.521Z','2026-04-23T21:04:39.521Z','/api/media/file/BEATINGHEART2.webp',NULL,'BEATINGHEART2.webp','image/webp',69472,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(60,'how to build a beating heart frame','2026-04-23T21:04:44.881Z','2026-04-23T21:04:44.881Z','/api/media/file/BEATINGHEART3.webp',NULL,'BEATINGHEART3.webp','image/webp',64038,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(61,'inside guantanamo frame','2026-04-23T21:05:49.730Z','2026-04-23T21:05:49.730Z','/api/media/file/INSIDEGITMO1.webp',NULL,'INSIDEGITMO1.webp','image/webp',16238,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(62,'inside guantanamo frame','2026-04-23T21:05:55.019Z','2026-04-23T21:05:55.019Z','/api/media/file/Guantanamo%2BBay%2C%2BCuba.webp',NULL,'Guantanamo+Bay,+Cuba.webp','image/webp',5076,309,173);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(63,'inside guantanamo frame','2026-04-23T21:05:59.770Z','2026-04-23T21:05:59.770Z','/api/media/file/INSIDEGITMO2.webp',NULL,'INSIDEGITMO2.webp','image/webp',28482,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(64,'Gorilla Murders Frame','2026-04-23T21:06:50.722Z','2026-04-23T21:06:50.722Z','/api/media/file/Gorilla%2BMurders-1.webp',NULL,'Gorilla+Murders-1.webp','image/webp',70078,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(65,'Gorilla Murders Frame','2026-04-23T21:06:56.037Z','2026-04-23T21:06:56.037Z','/api/media/file/Gorilla%2BMurders-2.webp',NULL,'Gorilla+Murders-2.webp','image/webp',98378,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(66,'Gorilla Murders Frame','2026-04-23T21:07:04.647Z','2026-04-23T21:07:04.647Z','/api/media/file/Gorilla%2BMurders-3.webp',NULL,'Gorilla+Murders-3.webp','image/webp',99762,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(67,'JOURNEY TO AN ALIEN MOON frame','2026-04-23T21:07:56.053Z','2026-04-23T21:07:56.053Z','/api/media/file/JOURNEYTOANALIENMOON-1.webp',NULL,'JOURNEYTOANALIENMOON-1.webp','image/webp',81510,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(68,'JOURNEY TO AN ALIEN MOON frame','2026-04-23T21:08:00.346Z','2026-04-23T21:08:00.346Z','/api/media/file/JOURNEYTOANALIENMOON-2.webp',NULL,'JOURNEYTOANALIENMOON-2.webp','image/webp',77382,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(69,'JOURNEY TO AN ALIEN MOON frame','2026-04-23T21:08:05.270Z','2026-04-23T21:08:05.270Z','/api/media/file/JOURNEYTOANALIENMOON-3.webp',NULL,'JOURNEYTOANALIENMOON-3.webp','image/webp',66884,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(70,'moment of death frame','2026-04-23T21:09:11.383Z','2026-04-23T21:09:11.383Z','/api/media/file/momentofdeath-1.webp',NULL,'momentofdeath-1.webp','image/webp',41566,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(71,'moment of death frame','2026-04-23T21:09:16.891Z','2026-04-23T21:09:16.891Z','/api/media/file/momentofdeath-2.webp',NULL,'momentofdeath-2.webp','image/webp',17986,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(72,'moment of death frame','2026-04-23T21:09:23.051Z','2026-04-23T21:09:23.051Z','/api/media/file/momentofdeath-3.webp',NULL,'momentofdeath-3.webp','image/webp',47420,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(73,'to catch a smuggler frame','2026-04-23T21:10:50.634Z','2026-04-23T21:10:50.634Z','/api/media/file/agent_contraband-3.webp',NULL,'agent_contraband-3.webp','image/webp',67422,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(74,'to catch a smuggler frame','2026-04-23T21:10:55.550Z','2026-04-23T21:10:55.550Z','/api/media/file/agent_contraband-2.webp',NULL,'agent_contraband-2.webp','image/webp',66760,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(75,'to catch a smuggler frame','2026-04-23T21:11:00.174Z','2026-04-23T21:11:00.174Z','/api/media/file/Screen%2BShot%2B2014-01-09%2Bat%2B1.30.43%2BPM.webp',NULL,'Screen+Shot+2014-01-09+at+1.30.43+PM.webp','image/webp',69712,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(76,'secret lives of the apostles frame','2026-04-23T21:11:46.509Z','2026-04-23T21:11:46.509Z','/api/media/file/Apostles%2B1.webp',NULL,'Apostles+1.webp','image/webp',62312,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(77,'secret lives of the apostles frame','2026-04-23T21:11:51.836Z','2026-04-23T21:11:51.836Z','/api/media/file/Apostles2.webp',NULL,'Apostles2.webp','image/webp',90638,310,174);
INSERT INTO "media" ("id","alt","updated_at","created_at","url","thumbnail_u_r_l","filename","mime_type","filesize","width","height") VALUES(78,'secret lives of the apostles frame','2026-04-23T21:11:57.329Z','2026-04-23T21:11:57.329Z','/api/media/file/Apostles3.webp',NULL,'Apostles3.webp','image/webp',57322,310,174);
CREATE TABLE `payload_locked_documents` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`global_slug` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
CREATE TABLE `payload_locked_documents_rels` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`order` integer,
  	`parent_id` integer NOT NULL,
  	`path` text NOT NULL,
  	`users_id` integer,
  	`media_id` integer, `projects_id` integer REFERENCES projects(id),
  	FOREIGN KEY (`parent_id`) REFERENCES `payload_locked_documents`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade
  );
CREATE TABLE `payload_preferences` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`key` text,
  	`value` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
INSERT INTO "payload_preferences" ("id","key","value","updated_at","created_at") VALUES(1,'collection-projects','{"limit":25}','2026-04-23T20:10:54.445Z','2026-02-28T23:01:59.815Z');
INSERT INTO "payload_preferences" ("id","key","value","updated_at","created_at") VALUES(2,'collection-media','{"limit":10}','2026-03-25T18:15:51.291Z','2026-02-28T23:03:05.841Z');
INSERT INTO "payload_preferences" ("id","key","value","updated_at","created_at") VALUES(3,'collection-users','{}','2026-03-05T21:30:51.436Z','2026-03-05T21:30:51.436Z');
CREATE TABLE `payload_preferences_rels` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`order` integer,
  	`parent_id` integer NOT NULL,
  	`path` text NOT NULL,
  	`users_id` integer,
  	FOREIGN KEY (`parent_id`) REFERENCES `payload_preferences`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
  );
INSERT INTO "payload_preferences_rels" ("id","order","parent_id","path","users_id") VALUES(3,NULL,3,'user',1);
INSERT INTO "payload_preferences_rels" ("id","order","parent_id","path","users_id") VALUES(4,NULL,2,'user',1);
INSERT INTO "payload_preferences_rels" ("id","order","parent_id","path","users_id") VALUES(5,NULL,1,'user',1);
CREATE TABLE `payload_migrations` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`name` text,
  	`batch` numeric,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
INSERT INTO "payload_migrations" ("id","name","batch","updated_at","created_at") VALUES(1,'20250929_111647',1,'2026-02-28T22:50:45.219Z','2026-02-28T22:50:45.218Z');
INSERT INTO "payload_migrations" ("id","name","batch","updated_at","created_at") VALUES(2,'20260228_225145_initial',2,'2026-02-28T22:52:35.228Z','2026-02-28T22:52:35.227Z');
INSERT INTO "payload_migrations" ("id","name","batch","updated_at","created_at") VALUES(3,'20260331_201859_add_credits',3,'2026-03-31T20:33:20.366Z','2026-03-31T20:33:20.364Z');
INSERT INTO "payload_migrations" ("id","name","batch","updated_at","created_at") VALUES(4,'20260401_add_awards',4,'2026-04-01T20:16:40.460Z','2026-04-01T20:16:40.459Z');
ANALYZE sqlite_schema;
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_migrations','payload_migrations_created_at_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_migrations','payload_migrations_updated_at_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('_cf_KV','_cf_KV','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects','projects_created_at_idx','2 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects','projects_updated_at_idx','2 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('users','users_email_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('users','users_created_at_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('users','users_updated_at_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('media','media_filename_idx','6 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('media','media_created_at_idx','6 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('media','media_updated_at_idx','6 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_preferences','payload_preferences_created_at_idx','2 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_preferences','payload_preferences_updated_at_idx','2 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_preferences','payload_preferences_key_idx','2 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('users_sessions','users_sessions_parent_id_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('users_sessions','users_sessions_order_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('users_sessions','sqlite_autoindex_users_sessions_1','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_preferences_rels','payload_preferences_rels_users_id_idx','2 2');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_preferences_rels','payload_preferences_rels_path_idx','2 2');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_preferences_rels','payload_preferences_rels_parent_idx','2 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_preferences_rels','payload_preferences_rels_order_idx','2 2');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects_credits','projects_credits_parent_id_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects_credits','projects_credits_order_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects_credits','sqlite_autoindex_projects_credits_1','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_locked_documents','payload_locked_documents_created_at_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_locked_documents','payload_locked_documents_updated_at_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_locked_documents','payload_locked_documents_global_slug_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_locked_documents_rels','payload_locked_documents_rels_projects_id_idx','2 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_locked_documents_rels','payload_locked_documents_rels_media_id_idx','2 2');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_locked_documents_rels','payload_locked_documents_rels_users_id_idx','2 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_locked_documents_rels','payload_locked_documents_rels_path_idx','2 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_locked_documents_rels','payload_locked_documents_rels_parent_idx','2 2');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('payload_locked_documents_rels','payload_locked_documents_rels_order_idx','2 2');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects_awards','projects_awards_parent_id_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects_awards','projects_awards_order_idx','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects_awards','sqlite_autoindex_projects_awards_1','1 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects_rels','projects_rels_media_id_idx','69 1');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects_rels','projects_rels_path_idx','69 69');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects_rels','projects_rels_parent_idx','69 3');
INSERT INTO "sqlite_stat1" ("tbl","idx","stat") VALUES('projects_rels','projects_rels_order_idx','69 23');
CREATE TABLE `projects` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`title` text NOT NULL,
  	`date` text NOT NULL,
  	`description` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(1,'Breaking the Deadlock','2024-05-20T12:00:00.000Z','{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"A panel of influential figures talks through ethical dilemmas based on a real-life scenario.","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Director MARK MANNUCCI","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Producers JONATHAN HALPERIN & MARK MANNUCCI","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Executive Producers ANDREW LACK, NINA WEINSTEIN, JOHN BREDAR, LAURIE DONNELLY","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Editor MICHAEL PASQUARIELLO ","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"WGBH Educational Foundation, Andrew Lack & Room 608 ","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}','2026-03-31T20:53:04.192Z','2026-02-28T23:04:17.423Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(2,'A Trip to Infinity','2022-09-26T12:00:00.000Z','{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Does infinity exist? Can we experience the Infinite? In an animated film (created by artists from 10 countries) the world''s most cutting-edge scientists and mathematicians go in search of the infinite and its mind-bending implications for the universe.","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"A Trip to Infinity made the Netflix Top 10 list in 32 countries and a 4 1/2 minute scene went viral on TikTok with 18 million views in a week. ","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}','2026-04-09T21:52:23.211Z','2026-02-28T23:06:52.460Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(3,'Dr. Tony Fauci','2023-02-10T12:00:00.000Z','{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Follow Dr. Anthony Fauci as he grapples with the COVID-19 pandemic and his 50-year career as the nation’s leading public health advocate. American Masters: Dr. Tony Fauci reveals a rarely seen side of the physician, husband and father as he confronts political backlash, a new administration and questions of the future. ","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}','2026-04-01T20:35:52.827Z','2026-03-25T18:18:09.557Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(4,'Headspace Guide to Meditation','2021-01-01T12:00:00.000Z',NULL,'2026-04-21T17:43:03.133Z','2026-04-21T17:43:03.133Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(5,'Decoding Watson','2026-01-02T12:00:00.000Z',NULL,'2026-04-21T17:44:17.304Z','2026-04-21T17:44:17.304Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(6,'The History of White People in America','2024-10-07T12:00:00.000Z','{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}','2026-04-21T17:46:17.980Z','2026-04-21T17:46:17.980Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(7,'Beyond A Year in Space','2026-11-15T12:00:00.000Z',NULL,'2026-04-21T17:48:00.773Z','2026-04-21T17:48:00.773Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(8,'A Year in Space','2016-03-02T12:00:00.000Z','{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}','2026-04-21T17:49:33.655Z','2026-04-21T17:49:33.655Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(9,'Faces of Death','2026-04-21T12:00:00.000Z',NULL,'2026-04-21T17:51:58.874Z','2026-04-21T17:51:58.874Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(10,'The Day the ''60s Died','2015-04-28T12:00:00.000Z',NULL,'2026-04-23T20:55:42.607Z','2026-04-23T20:54:39.887Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(11,'Times Square Time Machine','2016-03-30T12:00:00.000Z',NULL,'2026-04-23T20:56:42.186Z','2026-04-23T20:56:42.186Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(12,'Curious','2026-04-23T12:00:00.000Z',NULL,'2026-04-23T20:57:41.575Z','2026-04-23T20:57:41.575Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(13,'The Cave','2026-04-23T12:00:00.000Z',NULL,'2026-04-23T20:59:00.323Z','2026-04-23T20:59:00.323Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(14,'Buried in Burma','2000-02-15T12:00:00.000Z',NULL,'2026-04-23T21:00:30.145Z','2026-04-23T21:00:30.145Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(15,'Turning Science Into Cures - The Jackson Laboratory','2026-04-23T12:00:00.000Z',NULL,'2026-04-23T21:01:37.521Z','2026-04-23T21:01:37.521Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(16,'Inside Death Row','2009-07-12T12:00:00.000Z',NULL,'2026-04-23T21:02:54.550Z','2026-04-23T21:02:54.550Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(17,'How to Build a Beating Heart','2011-02-01T12:00:00.000Z',NULL,'2026-04-23T21:04:46.040Z','2026-04-23T21:04:46.040Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(18,'Inside Guantanamo','2009-04-05T12:00:00.000Z',NULL,'2026-04-23T21:06:01.479Z','2026-04-23T21:06:01.479Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(19,'Gorilla Murders','2008-07-01T12:00:00.000Z',NULL,'2026-04-23T21:07:09.137Z','2026-04-23T21:07:09.137Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(20,'Journey to an Alien Moon','2010-04-20T12:00:00.000Z',NULL,'2026-04-23T21:08:06.524Z','2026-04-23T21:08:06.524Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(21,'Moment of Death','2008-09-02T12:00:00.000Z',NULL,'2026-04-23T21:09:23.866Z','2026-04-23T21:09:23.866Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(22,'To Catch a Smuggler','2012-10-08T12:00:00.000Z',NULL,'2026-04-23T21:11:01.047Z','2026-04-23T21:11:01.047Z');
INSERT INTO "projects" ("id","title","date","description","updated_at","created_at") VALUES(23,'Secret Lives of the Apostles','2012-04-05T12:00:00.000Z',NULL,'2026-04-23T21:11:59.790Z','2026-04-23T21:11:59.790Z');
CREATE TABLE `projects_rels` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`order` integer,
  	`parent_id` integer NOT NULL,
  	`path` text NOT NULL,
  	`media_id` integer,
  	FOREIGN KEY (`parent_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade
  );
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(10,1,1,'images',1);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(11,2,1,'images',2);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(12,3,1,'images',3);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(13,1,3,'images',18);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(14,2,3,'images',17);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(15,3,3,'images',16);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(16,1,2,'images',4);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(17,2,2,'images',5);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(18,3,2,'images',6);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(19,1,4,'images',19);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(20,2,4,'images',20);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(21,3,4,'images',21);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(22,1,5,'images',22);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(23,2,5,'images',23);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(24,3,5,'images',24);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(25,1,6,'images',25);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(26,2,6,'images',26);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(27,3,6,'images',27);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(28,1,7,'images',28);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(29,2,7,'images',29);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(30,3,7,'images',30);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(31,1,8,'images',31);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(32,2,8,'images',32);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(33,3,8,'images',33);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(34,1,9,'images',34);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(35,2,9,'images',35);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(36,3,9,'images',36);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(37,1,10,'images',37);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(38,2,10,'images',38);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(39,3,10,'images',39);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(40,1,11,'images',40);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(41,2,11,'images',41);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(42,3,11,'images',42);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(43,1,12,'images',43);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(44,2,12,'images',44);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(45,3,12,'images',45);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(46,1,13,'images',46);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(47,2,13,'images',47);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(48,3,13,'images',48);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(49,1,14,'images',49);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(50,2,14,'images',50);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(51,3,14,'images',51);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(52,1,15,'images',52);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(53,2,15,'images',53);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(54,3,15,'images',54);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(55,1,16,'images',55);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(56,2,16,'images',56);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(57,3,16,'images',57);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(58,1,17,'images',58);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(59,2,17,'images',59);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(60,3,17,'images',60);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(61,1,18,'images',61);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(62,2,18,'images',62);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(63,3,18,'images',63);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(64,1,19,'images',64);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(65,2,19,'images',65);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(66,3,19,'images',66);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(67,1,20,'images',67);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(68,2,20,'images',68);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(69,3,20,'images',69);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(70,1,21,'images',70);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(71,2,21,'images',71);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(72,3,21,'images',72);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(73,1,22,'images',73);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(74,2,22,'images',74);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(75,3,22,'images',75);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(76,1,23,'images',76);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(77,2,23,'images',77);
INSERT INTO "projects_rels" ("id","order","parent_id","path","media_id") VALUES(78,3,23,'images',78);
CREATE TABLE `payload_kv` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`key` text NOT NULL,
  	`data` text NOT NULL
  );
CREATE TABLE `projects_credits` (
  	`_order` integer NOT NULL,
  	`_parent_id` integer NOT NULL,
  	`id` text PRIMARY KEY NOT NULL,
  	`role` text NOT NULL,
  	`name` text NOT NULL,
  	FOREIGN KEY (`_parent_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
  );
INSERT INTO "projects_credits" ("_order","_parent_id","id","role","name") VALUES(1,1,'69cc33dc609ae104f7aa1193','Director','Mark Mannucci');
INSERT INTO "projects_credits" ("_order","_parent_id","id","role","name") VALUES(1,3,'69cd8193fa0da52d9a1aa2cc','Director','Mark Mannucci');
INSERT INTO "projects_credits" ("_order","_parent_id","id","role","name") VALUES(1,2,'69d81f719ab04473e15e2891','Director','Jonathon Halperin');
CREATE TABLE `projects_awards` (
  	`_order` integer NOT NULL,
  	`_parent_id` integer NOT NULL,
  	`id` text PRIMARY KEY NOT NULL,
  	`type` text NOT NULL,
  	`details` text,
  	FOREIGN KEY (`_parent_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
  );
INSERT INTO "projects_awards" ("_order","_parent_id","id","type","details") VALUES(1,3,'69cd7e19fa0da52d9a1aa2cb','primetime-emmy','Test');
CREATE INDEX `users_sessions_order_idx` ON `users_sessions` (`_order`);
CREATE INDEX `users_sessions_parent_id_idx` ON `users_sessions` (`_parent_id`);
CREATE INDEX `users_updated_at_idx` ON `users` (`updated_at`);
CREATE INDEX `users_created_at_idx` ON `users` (`created_at`);
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);
CREATE INDEX `media_updated_at_idx` ON `media` (`updated_at`);
CREATE INDEX `media_created_at_idx` ON `media` (`created_at`);
CREATE UNIQUE INDEX `media_filename_idx` ON `media` (`filename`);
CREATE INDEX `payload_locked_documents_global_slug_idx` ON `payload_locked_documents` (`global_slug`);
CREATE INDEX `payload_locked_documents_updated_at_idx` ON `payload_locked_documents` (`updated_at`);
CREATE INDEX `payload_locked_documents_created_at_idx` ON `payload_locked_documents` (`created_at`);
CREATE INDEX `payload_locked_documents_rels_order_idx` ON `payload_locked_documents_rels` (`order`);
CREATE INDEX `payload_locked_documents_rels_parent_idx` ON `payload_locked_documents_rels` (`parent_id`);
CREATE INDEX `payload_locked_documents_rels_path_idx` ON `payload_locked_documents_rels` (`path`);
CREATE INDEX `payload_locked_documents_rels_users_id_idx` ON `payload_locked_documents_rels` (`users_id`);
CREATE INDEX `payload_locked_documents_rels_media_id_idx` ON `payload_locked_documents_rels` (`media_id`);
CREATE INDEX `payload_preferences_key_idx` ON `payload_preferences` (`key`);
CREATE INDEX `payload_preferences_updated_at_idx` ON `payload_preferences` (`updated_at`);
CREATE INDEX `payload_preferences_created_at_idx` ON `payload_preferences` (`created_at`);
CREATE INDEX `payload_preferences_rels_order_idx` ON `payload_preferences_rels` (`order`);
CREATE INDEX `payload_preferences_rels_parent_idx` ON `payload_preferences_rels` (`parent_id`);
CREATE INDEX `payload_preferences_rels_path_idx` ON `payload_preferences_rels` (`path`);
CREATE INDEX `payload_preferences_rels_users_id_idx` ON `payload_preferences_rels` (`users_id`);
CREATE INDEX `payload_migrations_updated_at_idx` ON `payload_migrations` (`updated_at`);
CREATE INDEX `payload_migrations_created_at_idx` ON `payload_migrations` (`created_at`);
CREATE INDEX `projects_updated_at_idx` ON `projects` (`updated_at`);
CREATE INDEX `projects_created_at_idx` ON `projects` (`created_at`);
CREATE INDEX `projects_rels_order_idx` ON `projects_rels` (`order`);
CREATE INDEX `projects_rels_parent_idx` ON `projects_rels` (`parent_id`);
CREATE INDEX `projects_rels_path_idx` ON `projects_rels` (`path`);
CREATE INDEX `projects_rels_media_id_idx` ON `projects_rels` (`media_id`);
CREATE UNIQUE INDEX `payload_kv_key_idx` ON `payload_kv` (`key`);
CREATE INDEX `payload_locked_documents_rels_projects_id_idx` ON `payload_locked_documents_rels` (`projects_id`);
CREATE INDEX `projects_credits_order_idx` ON `projects_credits` (`_order`);
CREATE INDEX `projects_credits_parent_id_idx` ON `projects_credits` (`_parent_id`);
CREATE INDEX `projects_awards_order_idx` ON `projects_awards` (`_order`);
CREATE INDEX `projects_awards_parent_id_idx` ON `projects_awards` (`_parent_id`);
