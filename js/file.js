$(document).ready(function() {
    var textarea = document.getElementById('chat_box');

    console.log(textarea);

    textarea.ondrop = dropEvent;
    textarea.ondragover = dragOverEvent;
});

function dropEvent(event){
  console.log('Droppp !!!!!!');
  event.preventDefault();

  // If dropped items aren't files, reject them
  var dt = event.dataTransfer;
  if (dt.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i=0; i < dt.items.length; i++) {
      if (dt.items[i].kind == "file") {
        var f = dt.items[i].getAsFile();
        setFile(f);
        console.log("... file[" + i + "].name = " + f.name);
        console.log(f);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i=0; i < dt.files.length; i++) {
      setFile(dt.files[i]);
      console.log("... file[" + i + "].name = " + dt.files[i].name);
      console.log(dt.files[i]);
    }
  }
  console.log(event);
}

function dragOverEvent(event){
  event.preventDefault();
  console.log(event);
}

function setFile(file){
  var file_div = document.getElementById('chat_files');
  document.getElementById('chat_box').classList.add('hidden');
  file_div.setAttribute('data-src', file.path);
  file_div.innerHTML = '';
  file_div.classList.remove('hidden');

  var file_pic = document.createElement('i');
  file_pic.classList.add('zmdi');
   file_pic.classList.add('zmdipic');
  if(file.type.indexOf('image') != -1){
    file_pic.classList.add('zmdi-image-o');
  }else{
    file_pic.classList.add('zmdi-file');
  }

  var file_elem = document.createElement('p');
  file_elem.innerHTML = file.name;

  var file_delete = document.createElement('i');
  file_delete.classList.add('zmdi');
  file_delete.classList.add('zdmiclose');
  file_delete.classList.add('zmdi-close');
  file_delete.onclick = removeFile;

  file_div.appendChild(file_pic);
  file_div.appendChild(file_elem);
  file_div.appendChild(file_delete);
}

function removeFile(){
  var file_div = document.getElementById('chat_files');
  file_div.classList.add('hidden');
  document.getElementById('chat_box').classList.remove('hidden');
}
