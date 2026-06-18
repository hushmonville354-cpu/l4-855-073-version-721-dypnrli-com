(function(){
  var toggle=document.querySelector('.menu-toggle');
  var panel=document.querySelector('.mobile-panel');
  if(toggle&&panel){toggle.addEventListener('click',function(){panel.classList.toggle('open')})}
  var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
  var dots=[].slice.call(document.querySelectorAll('.hero-dot'));
  if(slides.length){
    var current=0;
    function show(i){current=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle('active',n===current)});dots.forEach(function(d,n){d.classList.toggle('active',n===current)})}
    var prev=document.querySelector('.hero-prev');
    var next=document.querySelector('.hero-next');
    if(prev)prev.addEventListener('click',function(){show(current-1)});
    if(next)next.addEventListener('click',function(){show(current+1)});
    dots.forEach(function(d,n){d.addEventListener('click',function(){show(n)})});
    setInterval(function(){show(current+1)},5200);
  }
  var input=document.querySelector('.site-filter');
  var year=document.querySelector('.year-filter');
  var list=document.querySelector('.filter-list');
  function applyFilter(){
    if(!list)return;
    var q=input?input.value.trim().toLowerCase():'';
    var y=year?year.value:'';
    list.querySelectorAll('[data-title]').forEach(function(card){
      var txt=[card.getAttribute('data-title'),card.getAttribute('data-tags'),card.getAttribute('data-year'),card.getAttribute('data-region')].join(' ').toLowerCase();
      var ok=(!q||txt.indexOf(q)>-1)&&(!y||card.getAttribute('data-year')===y);
      card.classList.toggle('hidden-card',!ok);
    });
  }
  if(input)input.addEventListener('input',applyFilter);
  if(year)year.addEventListener('change',applyFilter);
  var results=document.getElementById('searchResults');
  var searchInput=document.getElementById('searchInput');
  if(results&&typeof SEARCH_MOVIES!=='undefined'){
    var params=new URLSearchParams(location.search);
    var q=(params.get('q')||'').trim();
    if(searchInput)searchInput.value=q;
    function render(query){
      var term=(query||'').toLowerCase();
      var pool=SEARCH_MOVIES.filter(function(m){return !term||[m.t,m.r,m.y,m.g,m.c,m.k].join(' ').toLowerCase().indexOf(term)>-1}).slice(0,120);
      results.innerHTML=pool.map(function(m){return '<article class="movie-card"><a class="poster" href="'+m.u+'"><img src="./'+m.i+'.jpg" alt="'+escapeHtml(m.t)+'" loading="lazy"><span>'+escapeHtml(m.p)+'</span></a><div class="card-body"><h3><a href="'+m.u+'">'+escapeHtml(m.t)+'</a></h3><div class="meta-row"><span>'+escapeHtml(m.r)+'</span><span>'+escapeHtml(m.y)+'</span></div><p>'+escapeHtml(m.o)+'</p></div></article>'}).join('');
    }
    render(q);
    if(searchInput)searchInput.addEventListener('input',function(){render(searchInput.value.trim())});
  }
  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
})();
function setupPlayer(video,layer,src){
  if(!video||!src)return;
  var loaded=false;
  var hls=null;
  var pending=false;
  function tryPlay(){var p=video.play();if(p&&p.catch)p.catch(function(){})}
  function load(){
    if(loaded)return;
    loaded=true;
    if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src;if(pending)tryPlay()}
    else if(window.Hls&&Hls.isSupported()){hls=new Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(src);hls.attachMedia(video);hls.on(Hls.Events.MANIFEST_PARSED,function(){if(pending)tryPlay()})}
    else{video.src=src;if(pending)tryPlay()}
  }
  function start(){pending=true;load();if(layer)layer.classList.add('hide');tryPlay()}
  if(layer)layer.addEventListener('click',start);
  video.addEventListener('click',function(){if(video.paused)start()});
  video.addEventListener('play',function(){if(layer)layer.classList.add('hide')});
}