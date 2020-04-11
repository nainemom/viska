const B2 = require('backblaze-b2');
const path = require('path');
const fs = require('fs');
// const applicationKey = 'K000sUPmgS1YKxe1Od50uG0YZnaHAyk';
// const applicationKeyId = '0007e2b5cec3f940000000001';
// const bucketId = 'f74e72ab75bc5efc731f0914';



module.exports = async ({
  applicationKey,
  applicationKeyId,
  bucketId,
}) => {
  let bucketName = null;
  let uploadAuthToken = null;
  let uploadUrl = null;

  const b2 = new B2({
    applicationKeyId,
    applicationKey,
  });

  const _getUploadUrl = (force = false) => {
    return force || !uploadAuthToken ? b2.getUploadUrl({
      bucketId
    }).then((res) => {
      uploadAuthToken = res.data.authorizationToken;
      uploadUrl = res.data.uploadUrl;
      return {
        uploadAuthToken,
        uploadUrl,
      };
    }).catch((e) => {
      uploadAuthToken = null;
      uploadUrl = null;
      console.error(e);
    }) : Promise.resolve({
      uploadAuthToken,
      uploadUrl,
    });
  }

  const upload = async (filePath) => {
    const fileName = path.basename(filePath);
    const data = fs.readFileSync(filePath);
    const localUpload = async (uploadData) => {
      return b2.uploadFile({
        ...uploadData,
        fileName,
        data,
      });
    }
    try {
      const uploadData = await _getUploadUrl(false);
      return localUpload(uploadData);
    } catch (e) {
      const uploadData = await _getUploadUrl(false);
      return localUpload(uploadData);
    }
  }


  const download = async (filePath) => {
    const fileName = path.basename(filePath);
    const res = await b2.downloadFileByName({
      bucketName,
      fileName,
      responseType: 'arraybuffer',
    });
    fs.writeFileSync(filePath, res.data);
    return true;
  }

  await b2.authorize();
  const buckets = await b2.listBuckets();
  bucketName = buckets.data.buckets.find((_bucket) => _bucket.bucketId === bucketId).bucketName;

  return {
    upload,
    download,
  }
};
