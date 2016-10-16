package com.hk.ecm.claims.utils;

import java.util.ArrayList;

public class EcmUtils {

	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

	public EcmUtils() {
		// TODO Auto-generated constructor stub
	}

	public boolean checkEligableForStatusDispatch(String status,String dispatchingStatus) {
		
		if(/*status.equals(dispatchingStatus)*/status!=null)
			return true;
		else
			return false;
	}
	
	public boolean checkEligableForPaymentDispatch(String status,String dispatchingPayment) {
		
		String [] payments=dispatchingPayment.split(",");
		ArrayList<String>paymentStatus=new ArrayList<String>();
		for (int i = 0; i < payments.length; i++) {
			paymentStatus.add(payments[i]);
		}
		
		if(paymentStatus.contains(status))
			return true;
		else
			return false;
	}
}
