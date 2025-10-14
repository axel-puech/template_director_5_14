// -----JS CODE-----
global.PlayVideo = function (provider, count) {
	if (provider.status != VideoStatus.Preparing) {
		if (provider.status == VideoStatus.Playing
			|| provider.status == VideoStatus.Paused) {
			provider.stop();
		}
		if (provider.status != VideoStatus.Playing) {
			global.readyToPlay = true;
			provider.play(count);
		}
	}
}


global.StopVideo = function (provider) {
	if (provider.status != VideoStatus.Stopped) {
		provider.stop();
	}
}


global.PauseVideo = function (provider) {
	if (provider.status == VideoStatus.Playing) {
		provider.pause();
	}
	else if (provider.status == VideoStatus.Preparing) {
		print("WARNING : PauseVideo was called but the video was still preparing, call will be StopVideo.");
		provider.stop();
	}
}


global.ResumeVideo = function (provider) {
	if (provider.status != VideoStatus.Playing) {
		if (provider.status == VideoStatus.Paused) {
			provider.resume();
		}
		else if (provider.status == VideoStatus.Stopped) {
			print("WARNING : ResumeVideo was called but the video was stopped (play count will be 1).");
			provider.play(1);
		}
	}
}