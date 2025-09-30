This is a work in progress. I am building a pomodoro timer and only using AI, I'm not hand writing any of the code. It's not exactly vibe coding because I am watching the diffs, suggesting different ways of doing things, correcting it if I don't like the direction, etc. I am also bouncing changes off other AI models rather than just accepting them blindly. (Also, I seem to be working on it for 15 minutes at a time, once or twice a month.)

##### Version 0.4

Fixed a lot of the errors that were a result of the rollback described below. Fixed the Settings modal so that now it closes upon hitting save. Removed some unused code that ended up in there due to the rollback. I have added Warp from warp.dev to my workflow and working in the terminal with just a hint of IDE has been a gamechanger.

**To do:**

* Needs mobile fine tuning.
* Settings interface layout not final.
* Need to do an extensive testing session as I *think* sometimes the timer hangs for a fraction of a second. 

**Version 0.2.9**

Well it happened to me. One of the AI models I was using had a stroke and I didn't proofread well enough. I allowed in some terrible code and the timer was not working correctly. Whichever model it was made a large edit and inserted comments with "The rest of the code" instead of actually writing the code. I have reverted back to an earlier version which still has bugs in the pausing feature. 

**Version 0.3**

![Ver 0.2](https://raw.githubusercontent.com/KevanMacGee/HTML-Pom/refs/heads/main/screenshots/ScreenshotVer0_3.png)

I'm having trouble with the design through AI. I am used to tweaking the CSS by hand but I started this to make something entirely with AI. It doesn't always get what I mean and I'm frequently encountering instances when it would be way faster to just write the code myself. So I'm going to accept some "good enough" edits by AI for a while. I'll be concentrating on the functionality for the next few versions, even if it means the design is sub-par for a bit.

* Replaced `setInterval` to avoid time drift.
* Added the ability to remain accurate even if the browser goes inactive.
* Sounds are now complete, not rudimentary. (But I think I am going to redo them again.)
* Added ability to pick the number of Pomodoros.
* Still not satisfied with the settings layout and options.

**To do:**

* Modal styling is basic, not attractive. It needs a complete overhaul.
* Needs mobile fine tuning.
* Settings interface layout not final.
* "Paused" message doesn't disappear when the timer is un-paused.

**Version 0.2**

![Ver 0.2](https://raw.githubusercontent.com/KevanMacGee/HTML-Pom/refs/heads/main/screenshots/ScreenshotVer0_2a.png)
* Added rudimentary settings.
  - Need to add ability to pick number of cycles
    

**To do:**

~~* No options yet.~~
* Alarm sounds are still rudimentary.
* Modal styling is basic, not attractive
* Needs mobile fine tuning.
* Interface design not final.

**Version 0.1**

![Ver 0.1](https://raw.githubusercontent.com/KevanMacGee/HTML-Pom/refs/heads/main/screenshots/ScreenshotVer0_1.png)

**To do:**

~~* No options yet.~~
* Alarm sounds are stlll rudimentary.
* Needs mobile fine tuning.
* Interface design not final.
