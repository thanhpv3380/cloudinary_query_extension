import axios from "axios";

const DOMAIN_API = "https://blog-admin-client.herokuapp.com/api/v1";
const NUMBER_OF_IMAGE = 5;

let images = [];
async function fetchImagesInCloudinary(numberOfImage) {
  try {
    const { data } = await axios({
      url: `${DOMAIN_API}/images/cloudinary?numberOfImage=${numberOfImage}`,
      method: "GET",
    });
    if (data && data.status) {
      images = [...data.result.images];
      renderListImage();
    }
  } catch (error) {
    console.log(error.response);
  }
}
async function deleteImageInCloudinary(publicId) {
  try {
    const { data } = await axios({
      url: `${DOMAIN_API}/images/cloudinary/${publicId}`,
      method: "DELETE",
    });
    if (data && data.status) {
      return true;
    }
  } catch (error) {
    console.log(error.response);
  }
  return false;
}

async function uploadImageInCloudinary(formData) {
  try {
    const { data } = await axios({
      method: "POST",
      url: `${DOMAIN_API}/uploads/file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (data && data.status) {
      images = [{ ...data.result.image }, ...images];
      renderListImage();
    }
  } catch (error) {
    console.log(error.response);
  }
}

function handleCopyUrl(el) {
  const listImageDom = document.getElementById("list-image");

  const dummy = document.createElement("input");
  dummy.type = "text";
  dummy.className = "dummy";
  listImageDom.appendChild(dummy);

  dummy.setAttribute("value", el.url);
  dummy.select();

  document.execCommand("copy");
  listImageDom.removeChild(dummy);
}

async function handleDeleteImage(el) {
  const status = await deleteImageInCloudinary(el.public_id);
  if (status) {
    const delImgIndex = images.findIndex(
      (image) => image.public_id === el.public_id
    );
    const newImages = [...images];
    newImages.splice(delImgIndex, 1);
    images = [...newImages];
    renderListImage();
  }
}

function renderListImage() {
  const listImageDom = document.getElementById("list-image");
  const totalImageDom = document.getElementById("total_image");

  listImageDom.innerHTML = "";
  totalImageDom.textContent = `(total: ${images.length})`;
  images.forEach((el) => {
    if (el.resource_type !== "image") return;
    const row = document.createElement("div");
    row.className = "row";

    const actionBox = document.createElement("div");
    actionBox.className = "actionBox";

    const img = document.createElement("img");
    img.setAttribute("src", el.url);
    img.setAttribute("id", el.public_id);

    const btnCopy = document.createElement("button");
    btnCopy.innerHTML = '<i class="fas fa-copy iconBtn"></i>';
    btnCopy.onclick = function () {
      handleCopyUrl(el);
    };
    const btnDelete = document.createElement("button");

    btnDelete.onclick = function () {
      handleDeleteImage(el);
    };
    btnDelete.innerHTML = '<i class="fas fa-trash iconBtn"></i>';

    actionBox.appendChild(btnCopy);
    actionBox.appendChild(btnDelete);

    row.appendChild(img);
    row.appendChild(actionBox);

    listImageDom.appendChild(row);
  });
}
async function run() {
  await fetchImagesInCloudinary(NUMBER_OF_IMAGE);
}
run();

const uploadImgDom = document.getElementById("uploadImg");
uploadImgDom.addEventListener("change", async function (e) {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("file", file);

  await uploadImageInCloudinary(formData);
});
