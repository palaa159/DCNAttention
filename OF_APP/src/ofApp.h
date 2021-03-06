
#pragma once

#include "ofMain.h"
#include "Camera.h"
#include "Display.h"
#include "ContentModel.h"
#include "Data.h"
#include "ofxOsc.h"
#include "settings.h"

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
    

    //*** DISPLAY, CAMERA, DATA ***//
    Data dataConnect;
    Display display;
    Camera cam;
    bool camDebug = CAM_DEBUG;
    
    
    //*** CONTROL STUFF ***//
    void nextRound();
    void sendRound();
    vector <ofxJSONElement> thisPair;

    bool GO_MODE = false;
    int CURR_CAT;
    int CURR_CAT_URL; //bc non-zero indexed (apon, WHY)
    
    
    //*** OSC STUFFS ***//
    string getOscMsgAsString(ofxOscMessage m);
    void broadcastMessage(string message);
    vector<string>knownClients; //collected IP's of participants
    bool waitingCallback; //for master
    
    ofxOscSender oscSender;
    int     oscSendPort;
    string  oscSendHost;
    string  oscSendMessage;
    
    ofxOscReceiver oscRecvr;
    int     oscRecvPort;
    string  oscRecvdMessage;
};
