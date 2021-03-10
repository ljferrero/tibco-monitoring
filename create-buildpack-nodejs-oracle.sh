#!/bin/bash

  echo "download nodejs buildpack"
  basic_download_url="https://github.com/cloudfoundry/nodejs-buildpack/archive/master.zip"
  curl -L "$basic_download_url" --silent --fail --retry 5 --retry-max-time 15 -o "nodejs-buildpack-master.zip"
  echo "Downloaded [$basic_download_url]"
  echo "unzipping libraries"
  unzip nodejs-buildpack-master.zip
  mkdir nodejs-buildpack-master/instantclient
  cp -a instantclient/. nodejs-buildpack-master/instantclient/
  echo "CLIENT_FILENAME=instantclient-basic-linux.x64-12.1.0.2.0.zip" >> nodejs-buildpack-master/bin/supply
  echo "install_oracle_libraries(){" >> nodejs-buildpack-master/bin/supply
  echo "local build_dir=\${1:-}" >> nodejs-buildpack-master/bin/supply
  echo 'echo "Installing oracle libraries"' >> nodejs-buildpack-master/bin/supply
  echo  "mkdir -p \$build_dir/oracle/lib" >> nodejs-buildpack-master/bin/supply
  echo  'LIBS="*/*"' >> nodejs-buildpack-master/bin/supply
  echo  "unzip \$BUILDPACK_DIR/instantclient/\${CLIENT_FILENAME} \${LIBS}" >> nodejs-buildpack-master/bin/supply
  echo  "for lib in \${LIBS}; do mv \${lib} \$build_dir/oracle/lib; done" >> nodejs-buildpack-master/bin/supply
  echo "ln -s \$build_dir/oracle/lib/libclntsh.so.12.1 \$build_dir/oracle/lib/libclntsh.so"  >> nodejs-buildpack-master/bin/supply
  echo "}" >> nodejs-buildpack-master/bin/supply
  echo 'install_oracle_libraries "$BUILD_DIR"' >> nodejs-buildpack-master/bin/supply
  echo "export LD_LIBRARY_PATH=\$HOME/oracle/lib:\${LD_LIBRARY_PATH:-}" >> nodejs-buildpack-master/profile/nodejs.sh 
  zip -r nodejs-buildpack-master-oracle.zip nodejs-buildpack-master
  rm -f nodejs-buildpack-master.zip
  rm -f -r nodejs-buildpack-master
