import { useS3Upload } from "next-s3-upload";

export default function UploadPage() {
  let { uploadToS3 } = useS3Upload();

  let handleFileChange = async (event : any) => {
    let file = event.target.files[0];
    let { url } = await uploadToS3(file);

    console.log("Successfully uploaded to S3!", url);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}
