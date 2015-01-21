//
//  settings.h
//  ofApp
//
//  Created by Joseph Saavedra on 1/19/15.
//
//

#pragma once

//----------------------------------------------------------------------
#define MASTER //COMMENT OUT TO RUN AS SLAVE (right screen)

//----------------------------------------------------------------------
//#define USE_DEBUG_VIDEO //COMMENT OUT TO USE LIVE CAM
#define CAM_DEVICE_ID 0
#define CAM_DEBUG true

//----------------------------------------------------------------------
//#define SCREEN_SETTING OF_WINDOW // window setting on startup
#define SCREEN_SETTING OF_FULLSCREEN

//----------------------------------------------------------------------
#define LEFT_SCREEN_IP  "10.0.1.10" // MASTER (left screen)
#define RIGHT_SCREEN_IP "10.0.1.11" // SLAVE  (right screen)

//----------------------------------------------------------------------
#define DATABASE_NAME "payattention" //on Parse "content_dummy_new"

//----------------------------------------------------------------------
#define NUM_CATEGORIES 7
#define ROUND_TIME 5.f