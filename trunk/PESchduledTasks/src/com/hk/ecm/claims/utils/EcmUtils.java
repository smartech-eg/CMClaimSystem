package com.hk.ecm.claims.utils;

import com.hk.ecm.claims.connection.ConnectionManager;

public class EcmUtils {

	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

	public EcmUtils() {
		// TODO Auto-generated constructor stub
	}

	public boolean checkEligableForDispatch(String status) {
		String dispatchingStatus = ConnectionManager.myResources
				.getString("Dispatching_Status");
		if (status.equals(dispatchingStatus))
			return true;
		else
			return false;
	}
}
