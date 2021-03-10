/**
 * Created by jiawenlong on 8/7/15.
 */
var sss =

  ' <process-dir height="832" id="TimerAndGroups" name="TimerAndGroups" type="process" width="1015" x="140" y="20"> ' +
  ' <ProcessInfo createdBy="Paine" createdOn="Thu Apr 04 16:45:09 PDT 2013" description="" modifiedBy="gdu" modifiedOn="Wed Aug 05 22:24:58 CST 2015" modifiers="private" productVersion="6.0.0 : pre-V35 : 2013-04-02" scalable="false" singleton="false" stateless="false" type="IT"/> ' +
  ' <link-dir id="495d275c-1f70-49d9-8481-a32b68a0db6d" label="" link_type="SUCCESS" name="Timer-to-WriteFile1" points="[[113,111],[113,408]]" source="afd63433-7ad8-455e-9c17-4a4e505dd8b8" target="3c59d681-2395-4de7-875d-3b6a94fdee32"/> ' +
  ' <activity-dir height="48" id="afd63433-7ad8-455e-9c17-4a4e505dd8b8" name="Timer" type="bw.generalactivities.timer" width="48" x="88" y="62"> ' +

  ' </activity-dir> ' +
  ' <link-dir id="e0ab78a0-7591-4b07-929f-df087409376d" label="" link_type="" name="WriteFile1-to-OuterGroup" points="[[137,432],[207,432]]" source="3c59d681-2395-4de7-875d-3b6a94fdee32" target="05855a97-2c5a-4860-886b-b55b5ebe0f9d"/> ' +
  ' <activity-dir height="48" id="3c59d681-2395-4de7-875d-3b6a94fdee32" name="WriteFile1" type="bw.file.write" width="48" x="88" y="408"> ' +


  ' </activity-dir> ' +
  ' <link-dir id="8d198eae-8aa5-4799-8b82-2d7cdaff3b3e" label="" link_type="SUCCESS" name="OuterGroup-to-End" points="[[823,602],[861,602],[861,644],[900,644]]" source="05855a97-2c5a-4860-886b-b55b5ebe0f9d" target="0bb709d4-59cf-4c0f-b559-26066688c3b3"/> ' +
  ' <scope-dir collapse="false" group="repeatUntil" height="741" id="05855a97-2c5a-4860-886b-b55b5ebe0f9d" name="OuterGroup" type="bpel.scope" width="615" x="207" y="62"> ' +
  ' <link-dir id="545a2642-d8f1-4a66-be6b-d9cd05f2a20f" label="" link_type="SUCCESS" name="InnerGroup2-to-GroupEnd" points="[[536,525],[556,525],[556,379],[603,379]]" source="314c37dd-40eb-41bb-966d-1f221c358a68" target="b41e4a92-969f-4462-9be7-9be7fd8431df"/> ' +
  ' <scope-dir collapse="false" group="repeatUntil" height="239" id="314c37dd-40eb-41bb-966d-1f221c358a68" name="InnerGroup2" type="bpel.scope" width="404" x="131" y="418"> ' +
  ' <link-dir id="606494a2-4014-4067-921e-6eabedb410ed" label="Otherwise" link_type="Otherwise" name="Null-2-to-LowerLog" points="[[106,95],[144,95],[144,192],[184,192]]" source="c08529ad-67a4-46fe-9dd2-89eaf40d1da5" target="94f30994-4206-4f40-981d-d209b5e325f9"/> ' +
  ' <activity-dir height="48" id="c08529ad-67a4-46fe-9dd2-89eaf40d1da5" name="Null-2" type="com.tibco.bw.core.design.process.editor.Activity_4002_Empty" width="48" x="57" y="71"/> ' +
  ' <link-dir id="c6105f67-abf6-4f82-be58-087eb0859d9d" label="" link_type="" name="Null-3-to-Null-5" points="[[233,47],[263,47],[263,95],[294,95]]" source="3c270c04-c41c-424a-b714-165c7efe0b7a" target="e828a4c7-53cc-4667-aac2-1848964bbc84"/> ' +
  ' <activity-dir height="48" id="3c270c04-c41c-424a-b714-165c7efe0b7a" name="Null-3" type="com.tibco.bw.core.design.process.editor.Activity_4002_Empty" width="48" x="184" y="23"/> ' +
  ' <link-dir id="b5ece033-7d33-40ba-9689-6169cd00f17a" label="" link_type="" name="LowerLog-to-Null-5" points="[[233,192],[263,192],[263,95],[294,95]]" source="94f30994-4206-4f40-981d-d209b5e325f9" target="e828a4c7-53cc-4667-aac2-1848964bbc84"/> ' +
  ' <activity-dir height="48" id="94f30994-4206-4f40-981d-d209b5e325f9" name="LowerLog" type="bw.file.write" width="48" x="184" y="168"> ' +

  ' </activity-dir> ' +
  ' <link-dir id="fd0da67b-1954-4518-b104-fa7facc015bb" label="" link_type="" name="Null-5-to-GroupEnd1" points="[[343,95],[361,95],[361,125],[392,125]]" source="e828a4c7-53cc-4667-aac2-1848964bbc84" target="14fdc9bb-6208-474b-8495-9c8135218ec5"/> ' +
  ' <activity-dir height="48" id="e828a4c7-53cc-4667-aac2-1848964bbc84" name="Null-5" type="com.tibco.bw.core.design.process.editor.Activity_4002_Empty" width="48" x="294" y="71"/> ' +
  ' <link-dir id="696589df-5425-45b2-9941-44cbfb0bf71a" label="" link_type="" name="GroupStart1-to-Null-2" points="[[13,125],[41,125],[41,95],[57,95]]" source="8e64e6cc-42bc-4f12-9e42-0387ae82520a" target="c08529ad-67a4-46fe-9dd2-89eaf40d1da5"/> ' +
  ' <activity-dir height="16" id="8e64e6cc-42bc-4f12-9e42-0387ae82520a" name="GroupStart1" type="groupStart" width="16" x="-7" y="117"/> ' +
  ' <activity-dir height="16" id="14fdc9bb-6208-474b-8495-9c8135218ec5" name="GroupEnd1" type="groupEnd" width="16" x="396" y="117"/> ' +
  ' </scope-dir> ' +
  ' <link-dir id="fd42c67b-29c7-4916-9969-b645ee00dcdc" label="" link_type="" name="MiddleLog-to-Null-6" points="[[243,295],[333,295],[333,343],[424,343]]" source="9e412267-f184-48e1-9721-d4cb6cf789c9" target="ad8f0d19-d4f0-4d48-89e3-3abb944b56b0"/> ' +
  ' <activity-dir height="48" id="9e412267-f184-48e1-9721-d4cb6cf789c9" name="MiddleLog" type="bw.file.write" width="48" x="194" y="271"> ' +


  ' </activity-dir> ' +
  ' <link-dir id="64741edc-5754-45d3-b37c-c37afd4ddfa8" label="" link_type="SUCCESS" name="UpperLog-to-InnerGroup1" points="[[95,109],[180,109]]" source="148fb0f5-e2f5-41eb-9d7e-7f0695fa2e00" target="85cd3f51-3455-4f5e-ac3d-da36e5db3a0e"/> ' +
  ' <activity-dir height="48" id="148fb0f5-e2f5-41eb-9d7e-7f0695fa2e00" name="UpperLog" type="bw.file.write" width="48" x="46" y="85"> ' +


  ' </activity-dir> ' +
  ' <link-dir id="da4cdcf3-2094-4069-9905-d6808307d4ba" label="" link_type="" name="Null-6ToSleep" points="[[473,319],[495,319],[495,251],[447,251],[447,272]]" source="ad8f0d19-d4f0-4d48-89e3-3abb944b56b0" target="961c3519-9f0f-42d7-aa33-df0760af445d"/> ' +
  ' <activity-dir height="48" id="ad8f0d19-d4f0-4d48-89e3-3abb944b56b0" name="Null-6" type="com.tibco.bw.core.design.process.editor.Activity_4002_Empty" width="48" x="424" y="319"/> ' +
  ' <link-dir id="d7601441-0f07-4371-91ab-5aefaf8ba581" label="" link_type="SUCCESS" name="InnerGroup1-to-GroupEnd" points="[[492,125],[542,125],[542,377],[603,377]]" source="85cd3f51-3455-4f5e-ac3d-da36e5db3a0e" target="b41e4a92-969f-4462-9be7-9be7fd8431df"/> ' +
  ' <scope-dir collapse="false" group="none" height="217" id="85cd3f51-3455-4f5e-ac3d-da36e5db3a0e" name="InnerGroup1" type="bpel.scope" width="311" x="180" y="25"> ' +
  ' <link-dir id="759a2186-ed09-4c65-a4cb-ccfb01572092" label="" link_type="" name="Null-to-Null-1" points="[[95,78],[211,78]]" source="f35c7a02-f7b2-44a7-bf2c-814d1ccbf97f" target="aa91c323-8a7c-471d-a6ea-405862d5d435"/> ' +
  ' <activity-dir height="48" id="f35c7a02-f7b2-44a7-bf2c-814d1ccbf97f" name="Null" type="com.tibco.bw.core.design.process.editor.Activity_4002_Empty" width="48" x="46" y="54"/> ' +
  ' <link-dir id="d57c4708-38b5-4628-bda1-5cc5909884ea" label="" link_type="" name="Null-1-to-GroupEnd2" points="[[260,78],[273,78],[273,114],[299,114]]" source="aa91c323-8a7c-471d-a6ea-405862d5d435" target="9b8d27ee-6aff-4e3e-b5c5-c23814210ec3"/> ' +
  ' <activity-dir height="48" id="aa91c323-8a7c-471d-a6ea-405862d5d435" name="Null-1" type="com.tibco.bw.core.design.process.editor.Activity_4002_Empty" width="48" x="211" y="54"/> ' +
  ' <link-dir id="570d889b-813c-4712-ba47-62e1760bfc94" label="" link_type="" name="GroupStart2-to-Null" points="[[13,114],[35,114],[35,78],[46,78]]" source="c00788eb-0583-4eec-b40b-b34eaeef20a9" target="f35c7a02-f7b2-44a7-bf2c-814d1ccbf97f"/> ' +
  ' <activity-dir height="16" id="c00788eb-0583-4eec-b40b-b34eaeef20a9" name="GroupStart2" type="groupStart" width="16" x="-7" y="106"/> ' +
  ' <activity-dir height="16" id="9b8d27ee-6aff-4e3e-b5c5-c23814210ec3" name="GroupEnd2" type="groupEnd" width="16" x="303" y="106"/> ' +
  ' </scope-dir> ' +
  ' <link-dir id="8f7ca6b1-f3eb-4594-b93a-a3cc8720ba63" label="" link_type="" name="SleepToGroupEnd" points="[[467,296],[528,296],[528,376],[603,376]]" source="961c3519-9f0f-42d7-aa33-df0760af445d" target="b41e4a92-969f-4462-9be7-9be7fd8431df"/> ' +
  ' <activity-dir height="48" id="961c3519-9f0f-42d7-aa33-df0760af445d" name="Sleep" type="bw.generalactivities.sleep" width="48" x="418" y="272"> ' +

  ' </activity-dir> ' +
  ' <link-dir id="ba32d34d-7845-4ff7-aeaa-0b497c28c69f" label="Otherwise" link_type="Otherwise" name="GroupStart-to-InnerGroup2" points="[[13,386],[56,386],[56,529],[131,529]]" source="2e11e12b-b9c4-44b2-ad24-d88b52f842f9" target="314c37dd-40eb-41bb-966d-1f221c358a68"/> ' +
  ' <activity-dir height="16" id="2e11e12b-b9c4-44b2-ad24-d88b52f842f9" name="GroupStart" type="groupStart" width="16" x="-7" y="368"/> ' +
  ' <activity-dir height="16" id="b41e4a92-969f-4462-9be7-9be7fd8431df" name="GroupEnd" type="groupEnd" width="16" x="607" y="368"/> ' +
  ' </scope-dir> ' +
  ' <activity-dir height="48" id="0bb709d4-59cf-4c0f-b559-26066688c3b3" name="End" type="com.tibco.bw.core.design.process.editor.Activity_4002_Empty" width="48" x="900" y="626"/> ' +
  ' </process-dir> '
