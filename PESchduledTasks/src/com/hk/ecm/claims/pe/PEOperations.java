package com.hk.ecm.claims.pe;

import java.util.HashMap;

import com.filenet.api.core.Connection;
import com.filenet.api.core.Domain;
import com.filenet.api.core.Factory;
import com.hk.ecm.claims.connection.ConnectionManager;

import filenet.vw.api.VWQueue;
import filenet.vw.api.VWSession;
import filenet.vw.api.VWStepElement;
import filenet.vw.api.VWWorkBasket;

public class PEOperations {
	
	public PEOperations() {
		// TODO Auto-generated constructor stub
	}
	
	
	public VWWorkBasket fetchWorkBasket(String queueName,String workBasketName,VWSession vwSession)
	{
        VWQueue queue= vwSession.getQueue(queueName);
		 VWWorkBasket workBasket=  queue.fetchWorkBasket(workBasketName);
	    return workBasket;
	   }
  public void updateWorkItemProperties (VWStepElement workItem,HashMap<String, Object> workItemParams) {
		
		for (String paramKey : workItemParams.keySet()) {
			workItem.setParameterValue(paramKey, workItemParams.get(paramKey), false);
		}
    	workItem.doSave(false);

		
	}
	
	
	public void  dispatchWithResponse(String response, VWStepElement workItem) {
		String stepResponse=ConnectionManager.myResources.getString("Step_Response");
		workItem.setSelectedResponse(stepResponse);
		workItem.doDispatch();
	}
	
	
	public Object getworkItemProperty(String propertyName, VWStepElement workItem) {
		return workItem.getParameterValue(propertyName);
	
	}
	
	public static void main(String[] args) {
		ConnectionManager connectionManager=new ConnectionManager();
		Connection conn=connectionManager.getFNConnection();
		Domain domain = Factory.Domain.fetchInstance(conn, null, null);
		System.out.println("Domain: " + domain.get_Name());
		//connectionManager.getVWSession();

	}
}
