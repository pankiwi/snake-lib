# snake-lib

It is a javaScript/js library customizable to create snake type units / work

![prev](sprites/prev-1.jpg)
Has Mindustry V7 sopport

***version library 1.0***
# compatibility

The library works correctly with the majority of the mods but the Betamind tubes can break the snake unit, as this happens, if the snake's head is inside a tube and save the map, the auto serpent will destroy
# how report error or bug
so that your usses is valid you need to meet these steps

1. version game
2. version library
3. send last log
4. send crash log if crash game
5. send code unit
5. is sure that it is a version of the modified library
6. Are you using the most recent version of the library

If you meet the steps indicated if error will be investigated and try to be fixed

# do you have questions?

Publish an issue with your question when I have time to answer it, if you do spam it will be blocked
or you can talking wirh me in discord

[discord](https://discord.gg/324aER8YKC)
## how use
download library.js and add file to scripts
now require file to unit
 ```js
 const library = require("library");
 // or "< folder >/library"
 
 //now make unit
 
 //snake are 2 types head and segment
 
 //the head is the one that controls and creates the segments, the segments without head they destruct
  
  // the head have body and end
  //In the segment builder and the head is customizable to edit or add or cancel functions of the unit
  //the engine of segment is customizable with how many engineers or other things
  
  //The segments must be added the segmentai to work correctly
 const endSnake = library.segment("nameUnitEnd", {
 //config
 //offset
 offsetSegment: 0,
 //amount engines
 engines: 0,
 //size engine
 engineSize: 0,
 //angle offset engine
 engineRotOffset: 0,
 }, {
   //constructor unit
 });
 endSnake.defaultController = library.segemntAI;
 
 const bodySnake = library.segment("nameUnitBody", {
  //config
   //offset
   offsetSegment: 0,
   //amount engines
   engines: 0,
   //size engine
   engineSize: 0,
   //angle offset engine
   engineRotOffset: 0,
  }, {
    //constructor unit
  });
  
 bodySnake.defaultController = library.segemntAI;
 
 //head the finger has parameters to control the length of the snake and assign the body and the end
 const headSnake = library.head("nameUnit", {
 //body and end
   body: bodySnake,
   end: endSnake,
   //length snake
   lengthSnake: 10
 }, {});
 
 //To create your snake you must use your head to create the, at the time of adding it to a unit factory or a reconstructor add the head not the segments
 ```
 