let video;
let subtitle;

$("#my-player").hide();
$("#media_chooser").click(function(){
  dialog.showOpenDialog({ properties: ["openFile"]}).then(function(x){
    video = x.filePaths[0];
    $("#tick0").show();
    $("#media_chooser").text(video);
    if(video !== undefined && subtitle !== undefined){
      $("#start_video").css("background-color", "green");
    }
  });
});
$("#subtitle_chooser").click(function(){
  dialog.showOpenDialog({ properties: ["openFile"]}).then(function(x){
    subtitle = x.filePaths[0];
    $("#tick1").show();
    $("#subtitle_chooser").text(subtitle);
    if(video !== undefined && subtitle !== undefined){
      $("#start_video").css("background-color", "green");
    }
  });
});
$("#start_video").click(function(){
  if(video !== undefined && subtitle !== undefined){
    lang = undefined;
    if(document.getElementById("lang_chooser").value=="tr")lang="tr";
    startProgram(video, subtitle, lang);
  }
});

function startProgram(video, subtitle, lang){
  $("#my-player").show();
  $("#loader").remove();
  window.player = videojs("my-player", function() {
      videojs_player = this;
      this.fluid(true);
  });

  window.player.ready(function(){
    let was_playing = false;
    let is_on = false;
    let player = this;
    let word_lookup_holder = document.createElement("div");
    let word_lookup = document.createElement("iframe");
    word_lookup_holder.id = "word_lookup_holder";
    word_lookup.style.display = "none";
    word_lookup.id = "word_lookup";
    word_lookup.frameborder="0";
    player.el().appendChild(word_lookup_holder);
    word_lookup_holder.appendChild(word_lookup);

    player.src(video);
    player.addRemoteTextTrack({
      kind: "captions",
      srclang: lang,
      src: subtitle
    });
    player.textTracks()[0].mode = "showing";

    player.on("texttrackchange", function(event){
        track = player.children()[3].el();
        if(track.children.length > 0){
          $(track.children[0].children[0]).each(function() {
              var $this = $(this);
              $this.html($this.text().replace(/([\p{L}-]+)/ug, "<span class='sub'>$1</span>"));
          });
          $(".sub").each(function(e){
            let word = $(this);
            console.log(word.width(), word.height(), word.offset());
          });

        }
    });
    player.tech_.off('mousedown');
    player.tech_.on('mousedown', function(e) {
        let subtitle = player.children()[3].el().innerText  ;
        console.log("click", event.clientX, event.clientY, subtitle, player.currentTime());
        if (player.paused()) {
          player.play();
        }
        else {
          player.pause();
        }
    });
    player.tech_.on('mousemove', function(e) {
        word_lookup.style.display = "none";
        let subtitle = player.children()[3].el().innerText;
        let mouseX = event.clientX;
        let mouseY = event.clientY;
        if(subtitle){
          let marX0 = $(player.children()[3].el().children[0].children[0]).offset().left;
          let marY0 = $(player.children()[3].el().children[0].children[0]).offset().top;
          let marX1 = marX0 + $(player.children()[3].el().children[0].children[0]).width();
          let marY1 = marY0 + $(player.children()[3].el().children[0].children[0]).height();
          is_on = false;
          $(".sub").each(function(e){
            let word = $(this);
            if(word.offset){
              let elX0 = word.offset().left;
              let elY0 = word.offset().top;
              let elX1 = elX0 + word.width();
              let elY1 = elY0 + word.height();
              if(elX0<=mouseX){
                if(mouseX<=elX1){
                  if(elY0<=mouseY){
                    if(mouseY<=elY1){
                      console.log(word.text());
                      if(!player.paused())was_playing = true;
                      player.pause();
                      word.css('background-color', 'rgba(30, 0, 120, 120)');
                      word_lookup.style.display = "";
                      word_lookup.style.left = elX0+"px";
                      word_lookup.style.top = "50px";
                      word_lookup.style.height = elY0-50+"px";
                      let new_src;
                      if(lang == "tr")new_src = "https://tureng.com/tr/turkce-ingilizce/"+word.text();
                      else new_src = "https://en.wiktionary.org/w/index.php?title="+word.text()+"&printable=yes";

                      if(new_src != word_lookup.src){
                        word_lookup.src = new_src;
                      }
                      is_on = true;
                      return;
                    }
                  }
                }
              }
              word.css('background-color', '');
            }
          });
          if(was_playing && !is_on){
            if(marX0<=mouseX){
              if(mouseX<=marX1){
                if(marY0<=mouseY){
                  if(mouseY<=marY1){
                    return;
                  }
                }
              }
            }
            player.play();
            was_playing=false;
          }
      }
    });
  });
}
