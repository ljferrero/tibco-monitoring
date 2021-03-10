### Install

```sh
npm install
npm start
```

Then it will automatically open the app in your browser

To run tests

```sh
npm test
```

Coverage

```sh
open reports/coverage/index.html
```

Build
```sh
npm install
npm run build
```

### Docker Container

Build
```sh
docker build -t bw6mon:<TAG_NAME> .
```

Run
```sh
docker run -p 8080:8080 bw6mon:<TAG_NAME>
```

### PCF Deployment

Follow the instructions on <http://confluence.tibco.com/display/TPFC/How+To+-+Install+PCF+Dev+on+Mac> to intall and configure PCF Dev, and then run this command:
```sh
cf push -f manifest.yml
```
