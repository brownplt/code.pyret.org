curl https://pyret-anchor.s3.amazonaws.com/anchor/anchor.zip > anchor.zip
unzip -d build/web/ anchor.zip
mkdir -p build/web/anchor/
cp -r build/web/build/* build/web/anchor