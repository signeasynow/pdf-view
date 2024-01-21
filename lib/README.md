# build
wasm-pack build --target web

# export 
cp -rf pkg/* ../sub_app/lib

# test

./node_modules/.bin/mocha ./src/utils/removeTextHelpersTests/removeTextFromPdf.test.mjs