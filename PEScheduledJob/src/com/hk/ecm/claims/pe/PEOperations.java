package com.hk.ecm.claims.pe;

import java.util.HashMap;

import org.apache.xerces.impl.xpath.XPath.Step;

import com.filenet.api.core.Connection;
import com.filenet.api.core.Domain;
import com.filenet.api.core.Factory;
import com.hk.ecm.claims.connection.ConnectionManager;

import filenet.vw.api.VWFetchType;
import filenet.vw.api.VWQueue;
import filenet.vw.api.VWQueueQuery;
import filenet.vw.api.VWSession;
import filenet.vw.api.VWStepElement;
import filenet.vw.api.VWWorkBasket;

public class PEOperations {

	public PEOperations() {
		// TODO Auto-generated constructor stub
	}

	public VWWorkBasket fetchWorkBasket(String queueName,
			String workBasketName, VWSession vwSession) {
		VWQueue queue = vwSession.getQueue(queueName);
		VWWorkBasket workBasket = queue.fetchWorkBasket(workBasketName);
		return workBasket;
	}

	public void updateWorkItemProperties(VWStepElement workItem,
			HashMap<String, Object> workItemParams) {

		for (String paramKey : workItemParams.keySet()) {
			workItem.setParameterValue(paramKey, workItemParams.get(paramKey),
					false);
		}
		workItem.doLock(true);
		workItem.doSave(false);

	}

	public void dispatchWithResponse(VWStepElement workItem) {
		String stepResponse = ConnectionManager.myResources
				.getString("Step_Response");

		workItem.doLock(true);
		workItem.doDispatch();
	}

	public Object getworkItemProperty(String propertyName,
			VWStepElement workItem) {
		return workItem.getParameterValue(propertyName);

	}

	public static void main(String[] args) {
		ConnectionManager connectionManager = new ConnectionManager();
		Connection conn = connectionManager.getFNConnection();
		Domain domain = Factory.Domain.fetchInstance(conn, null, null);
		System.out.println("Domain: " + domain.get_Name());

		VWSession session = connectionManager.getVWSession();
		System.out.println("-" + session.getCurrentVersion());
		 PEOperations operations = new PEOperations();
		 
		/*
		 * VWStepElement elemnt=(VWStepElement)
		 * operations.fetchWorkBasket("Inbox(0)", "ESOS_Pended Jobs",
		 * session).next(); System.out.println(elemnt.getParticipantName());
		 */
    /* String [] queues =session.getQueueNames(true);
		
     
     for (int i = 0; i < queues.length; i++) {
    	 System.out.println(queues[i]);
  		}
     
    VWQueue vwQueue= session.getQueue("GLCL_ClaimAccessorA");
    
		
		
		VWWorkBasket[] workBasket = vwQueue.fetchWorkBaskets();
		System.out.println("+"+workBasket.length);
		for (int i = 0; i < workBasket.length; i++) {
			System.out.println(workBasket[i].getName());
		}
*/
	    VWWorkBasket workbasket=operations.fetchWorkBasket("GLCL_CheckStatus", "CheckStatus", session);
	    System.out.println(workbasket.fetchCount());
	   
	    VWStepElement  workItem =(VWStepElement) workbasket.next();
	    String [] prams=workItem.getParameterNames();
		for (int i = 0; i < prams.length; i++) {
			System.out.println("**"+prams[i]);
			
		}
		
	//	operations.dispatchWithResponse(workItem);
	//workItem.doSave(false);
		
		//workItem.doDispatch();
	    //operations.dispatchWithResponse(workItem);
	    //connectionManager.getVWSession();
		
		//System.out.println(workbasket.fetchCount());
		/*while(workbasket.hasNext())
	      {
			 VWStepElement 	  workItem =(VWStepElement) workbasket.next();
			String [] prams=workItem.getParameterNames();
			for (int i = 0; i < prams.length; i++) {
				//System.out.println("**"+prams[i]);
				
			}
	      }*/
		
		

	}
	 public VWQueueQuery getQueryResult(String PrmName,String PramValue ,VWSession session ,String queueName)
	 {
	 	VWQueue queue=session.getQueue(queueName);
		 int queryFlags = VWQueue.QUERY_MIN_VALUES_INCLUSIVE + VWQueue.QUERY_MAX_VALUES_INCLUSIVE;
			int queryType = VWFetchType.FETCH_TYPE_STEP_ELEMENT;
			String queryFilter = PrmName+" ='"+PramValue+"'";
			VWQueueQuery queueQuery=queue.createQuery(null, null, null, queryFlags, queryFilter, null,queryType);
	      
			return queueQuery;
 	 }
	 
	 
}
