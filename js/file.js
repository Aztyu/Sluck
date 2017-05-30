$(document).ready(function() {
    var textarea = document.querySelector('body');
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


//La fonction permet de donner un fichier qui servira de piéce jointe en message
//param path Le chemin vers le fichier voulu
function setFile(path){
  var file_div = document.getElementById('chat_files');
  document.getElementById('chat_box').classList.add('hidden');
  file_div.setAttribute('data-src', path);
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

//Demarre la pop-up pour récupérer le fichier a envoyer dans le message
function findAttachment(){
  ipc.send('open-file-dialog');
}

ipc.on('selected-attachment', function (event, path) {
  /*var magic = new Magic();
  magic.detectFile(path[0], function(err, result) {
      if (err) throw err;
      console.log(result);
      // output on Windows with 32-bit node:
      //    PE32 executable (DLL) (GUI) Intel 80386, for MS Windows
  });*/

  setFile(path[0]);
})
