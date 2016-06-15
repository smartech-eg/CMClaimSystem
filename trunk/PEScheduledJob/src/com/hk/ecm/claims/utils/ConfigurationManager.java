package com.hk.ecm.claims.utils;

import java.util.HashMap;

import com.hk.ecm.claims.db.DBOperations;

public class ConfigurationManager {

	public static HashMap<String, String> configuration=DBOperations.loadConfigurations();
	
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

}
