
#pragma once

#include "ofMain.h"
#include "Camera.h"
#include "Display.h"
#include "ContentModel.h"
#include "Data.h"


class ofApp : public ofBaseApp {

public:

	void setup();
	void update();
	void draw();
    void keyPressed(int key);
    void keyReleased(int key);
    void mouseMoved(int x, int y );
    void mouseDragged(int x, int y, int button);
    void mousePressed(int x, int y, int button);
    void mouseReleased(int x, int y, int button);
    void windowResized(int w, int h);
    void dragEvent(ofDragInfo dragInfo);
    void gotMessage(ofMessage msg);
    
    void nextRound();

    Data dataConnect;
    
    int currContentIdx;
    
    Display display;

    Camera cam;
    bool CAM_DEBUG = true;
    
    bool GO_MODE = false;
    
    int CURR_CAT;
};