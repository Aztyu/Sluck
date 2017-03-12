function navigateTo(page_dest){
  var pages = document.querySelectorAll('[data-page]');
  for(var i=0; i<pages.length; i++){
    var page = pages[i];
    if(page.getAttribute('data-page') == page_dest){
      page.classList.remove('hidden');
    }else{
      page.classList.add('hidden');
    }
  }
}
