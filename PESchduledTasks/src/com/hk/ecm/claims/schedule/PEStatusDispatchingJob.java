package com.hk.ecm.claims.schedule;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.hk.ecm.claims.connection.ConnectionManager;
import com.hk.ecm.claims.db.DBOperations;
import com.hk.ecm.claims.pe.PEOperations;
import com.hk.ecm.claims.utils.EcmUtils;

import filenet.vw.api.VWSession;
import filenet.vw.api.VWStepElement;
import filenet.vw.api.VWWorkBasket;

public class PEStatusDispatchingJob implements Job {

	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

	@Override
	public void execute(JobExecutionContext arg0) throws JobExecutionException {
		
	 try {
		ConnectionManager connectionManager=new ConnectionManager();
		//load Configration
		String workItemProperty=ConnectionManager.myResources.getString("WorkItem_Property");
		String workBasketName=ConnectionManager.myResources.getString("WorkBasket_Name");
		String queueName=ConnectionManager.myResources.getString("PE_Queue_Name");
		String dispatchingResponse=ConnectionManager.myResources.getString("Step_Response");
		
		// open PE & DB Connections
		VWSession peSession=connectionManager.getVWSession();
        Connection dbConnection=connectionManager.getDBConnection();
        
        
        //intialization 
        
        VWStepElement workItem=null;
        DBOperations  dbOperations=new  DBOperations();
        EcmUtils ecmUtils=new EcmUtils();
        HashMap<String,Object> updatedProperties =new HashMap<>();
        
        
        //Logical Behavior
       PEOperations peOperations=new PEOperations();
       VWWorkBasket workBasket=peOperations.fetchWorkBasket(queueName, workBasketName, peSession);
    
       
       // updatedProperties.put("", "");
      while(workBasket.hasNext())
      {
    	  workItem =(VWStepElement) workBasket.next();
    	 String filterdWorkItemPropertyValue =(String)peOperations.getworkItemProperty(workItemProperty, workItem);
    	 String workItemStatus =dbOperations.getWorkItemStatus(dbConnection, filterdWorkItemPropertyValue);
    	 boolean eligableForDispatching =ecmUtils.checkEligableForDispatch(workItemStatus);
        if(eligableForDispatching)
        {
    	 peOperations.updateWorkItemProperties(workItem, updatedProperties); 
    	 peOperations.dispatchWithResponse(dispatchingResponse, workItem);
    	  
        }
      }
      
     //closing Connections
		dbConnection.close();
		
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
        
        
		
	}

}
