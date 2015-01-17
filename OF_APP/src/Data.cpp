//
//  Data.cpp
//  ofApp
//
//  Created by Joseph Saavedra on 1/14/15.
//
//

#include "Data.h"
#include "ofApp.h"

Data::Data(){
    
    
}


//--------------------------------------------------------------
int Data::pullData(){
    
    std::string url = "http://attention.market/api/getcontents";
    
    if (json.open(url)) {
        // print entire json object, raw
        //ofLogNotice("Data::pullData \n") << json.getRawString(true);
        parseData(json);
        return NUM_CATEGORIES;
    } else {
        ofLogNotice("ofApp::setup") << "****  !!! Failed to parse JSON !!!! *****\n\n";
        return 0;
    }
}

//--------------------------------------------------------------
bool Data::parseData(ofxJSONElement data){
    cout << "total objects received count: "<<data.size() << endl;
    
    // first go through and clear our local objects
    for (int i=0; i<data.size(); i++){
        int thisCatId = ofToInt(data[i]["cat_id"].asString()) - 1;
        categories[thisCatId].objects.clear();
        string thisCategoryJsonFilePath = "content/cat_"+ofToString(i+1)+".json";
        ofxJSONElement thisCategoryFile;
        ofDirectory dir(thisCategoryJsonFilePath);
        if(dir.exists()){
            thisCategoryFile.open(thisCategoryJsonFilePath);
            thisCategoryFile.clear();
            thisCategoryFile.save(thisCategoryJsonFilePath, true);
        }
    }

    // then repopulate all categories
    for (int i=0; i<data.size(); i++){
        int thisCatId = ofToInt(data[i]["cat_id"].asString()) - 1;
        //cout << "catId: "<<thisCatId << "    objId: "<<data[i]["objectId"].asString() <<endl;
        //Json::ArrayIndex id = data[i]["cat_id"].asInt();
        ofxJSONElement thisObj = data[i];
        categories[thisCatId].objects.push_back(thisObj);
    }
    
    // then go through and save individual files (.json and .jpgs)
    int totalCt = 0;
    for (int i=0; i<NUM_CATEGORIES; i++){
        int catCt = 0;
        string thisCategoryJsonFilePath = "content/cat_"+ofToString(i+1)+".json";

        ofxJSONElement thisCategoryFile;
        
        for(int j=0; j<categories[i].objects.size(); j++){
            int catId = ofToInt(categories[i].objects[j]["cat_id"].asString()); //server catId (1 indexed);
            //cout << "catId: "<< i << "\tobjId: "<<categories[i].objects[j]["objectId"].asString(); //<< "\tcatCounter: "<< catCt;
            
            string path = "content/cat_"+ofToString(catId)+"/"+categories[i].objects[j]["objectId"].asString()+"/img.jpg"; //TODO: account for .pngs???????
            categories[i].objects[j]["local_path"] = path;
            thisCategoryFile.append(categories[i].objects[j]);
            
            ofDirectory dir(path);
            if(dir.exists()){
                cout << "cat: "<<categories[i].objects[j]["cat_id"].asString() << "\tobjId: "<<categories[i].objects[j]["objectId"].asString() << "\tcount: " << totalCt << "\talready have file" << "\timage_url: "<< categories[i].objects[j]["image_url"].asString() << endl;
            } else {
                cout << totalCt << ":\tDOWNLOADING: "+path << "\timage_url: "<< categories[i].objects[j]["image_url"].asString() << endl;
                ofSaveURLAsync(categories[i].objects[j]["image_url"].asString(), path);
                //ofSaveURLTo(categories[i].objects[j]["image_url"].asString(), path);
            }
            catCt++;
            totalCt++;
        }
        thisCategoryFile.save(thisCategoryJsonFilePath,true);
    }
    cout << "\n----------------------------\n\ttotal object count: "<< totalCt<< "\n----------------------------"<<endl;
    
    return true;
}


//--------------------------------------------------------------
ofxJSONElement Data::getCategory(int cat){
    ofxJSONElement thisCategory;
    thisCategory.open("content/cat_"+ofToString(cat+1)+".json");
    return thisCategory;
}


//--------------------------------------------------------------
bool Data::pushData(string objectId, string updateObject){
    
    string cmd = "curl -X PUT \
    -H \"X-Parse-Application-Id: QKfYTUm0IwXbry5b5Mm4pUlrd3jizA8L6pkCmfwa\" \
    -H \"X-Parse-REST-API-Key: cGN5GZgtOYuf2Ktcm3VQd1NqDLGl7e1t1OaszbNB\" \
    -H \"Content-Type: application/json\" \
    -d '"+updateObject+"' \
    https://api.parse.com/1/classes/content_dummy/"+objectId;
    
    ofSystem( cmd );
}




//--------------------------------------------------------------
void Data::sendShowing(string leftObjId, string rightObjId, string catId){

    
    std::string url = "http://attention.market/api/shown?left="+leftObjId+"&right="+rightObjId+"&cat="+catId;
    cout << "SEND SHOWING GET: "<<url<<endl;
    
    if (json.open(url)) {
        ofLogNotice("Data::sendShowing resp: \n") << json.getRawString(true);
        parseData(json);
    } else {
        ofLogNotice("Data::sendShowing fail") << "****  !!! Failed to parse JSON !!!! *****\n\n";
    }
    // another strategy if needed
    // ofHttpResponse req1 = ofHttpRequest("http://requestb.in/1d0tdyo1", "request", true);
    // ofHttpResponse resp = ofLoadURLAsync("url.txt");
    // cout<<resp.data<<endl;
}




//*****************************************//
//****** NOT CURRENTLY USED/NEEDED ********//
//--------------------------------------------------------------
//bool Data::pullCategory(int cat){
//    std::string url = "http://attention.market/api/getContentsByCatId?id="+ofToString(cat+1);
//    string data;
//    
//    if (json.open(url)) {
//        //ofLogNotice("ofApp::setup") << json.getRawString(true);
//        parseCategory(json);
//        //if(cat <= NUM_CATEGORIES) getCategory(cat+1);
//        return true;
//        
//    } else {
//        return false;
//        ofLogNotice("ofApp::setup") << "****  !!! Failed to parse JSON !!!! *****\n\n";
//    }
//}
//
////--------------------------------------------------------------
//void Data::parseCategory(ofxJSONElement data){
//    
//    for(int i=0; i<data.size(); i++){
//        cout<< i << " - objectId:" << data[i]["objectId"].asString() <<endl;
//        cout<< i << " - cat_id:" << data[i]["cat_id"].asString() <<endl;
//        cout<< i << " - category:" << data[i]["category"].asString() <<endl;
//        cout<< i << " - company:" << data[i]["company"].asString() <<endl;
//        cout<< i << " - face_val:" << data[i]["face_val"].asString() <<endl;
//        cout<< i << " - social_val:" << data[i]["social_val"].asString() <<endl;
//        cout<< i << " - image_url:" << data[i]["image_url"].asString() <<endl;
//        cout<< i << " - headline:" << data[i]["headline"].asString() <<endl;
//        cout<< i << " - link:" << data[i]["link"].asString() <<endl;
//        cout<< "----------------------------------" << endl;
//        
//        string path = "content/cat_"+ofToString(data[i]["cat_id"].asInt())+"/"+data[i]["objectId"].asString()+"/img.jpg";
//        ofDirectory dir(path);
//        if(dir.exists()){
//            cout << "already have file" << endl;
//        } else {
//            cout << "downloading file: "+path <<endl;
//            ofSaveURLAsync(data[i]["image_url"].asString(), path);
//        }
//        
//    }
//    
//}