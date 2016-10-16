package com.hk.ecm.claims.schedule;

import java.sql.Connection;
import java.util.HashMap;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.hk.ecm.claims.ce.CEOperations;
import com.hk.ecm.claims.connection.ConnectionManager;
import com.hk.ecm.claims.db.DBOperations;
import com.hk.ecm.claims.pe.PEOperations;
import com.hk.ecm.claims.utils.ConfigurationManager;
import com.hk.ecm.claims.utils.EcmUtils;

import filenet.vw.api.VWSession;
import filenet.vw.api.VWStepElement;
import filenet.vw.api.VWWorkBasket;

public class PEStatusDispatchingJob implements Job {

	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

	public void execute(JobExecutionContext arg0) throws JobExecutionException {

		try {
			ConfigurationManager.configuration=DBOperations.loadConfigurations();
			ConnectionManager connectionManager = new ConnectionManager();
			// load Configration
			System.out.println("Loading Configrations..");
		/*	String workItemProperty = ConnectionManager.myResources
					.getString("WorkItem_Property");
			String statusWorkBasketName = ConnectionManager.myResources
					.getString("WorkBasket_Status_Name");
			String statusQueueName = ConnectionManager.myResources
					.getString("PE_Status_Queue_Name");
			String paymentWorkBasketName = ConnectionManager.myResources
					.getString("WorkBasket_Payment_Name");
			String paymentQueueName = ConnectionManager.myResources
					.getString("PE_Payment_Queue_Name");
			String workItemUpdatedProperty = ConnectionManager.myResources
					.getString("WorkItem_Updated_Property");*/

			String GUIDPropertyName = ConfigurationManager.configuration.get("GUID_PropertyName");
            String AmountPopertyName=ConfigurationManager.configuration.get("Amount_PopertyName");
			String target_ObjectStorename=ConfigurationManager.configuration.get("Tatget_ObjectStore_name");
			String amountDBColName=ConfigurationManager.configuration.get("Amount_Col_Name");
					
					
			String workItemProperty = ConfigurationManager.configuration.get("WorkItem_Property");
			String statusWorkBasketName = ConfigurationManager.configuration.get("WorkBasket_Status_Name");
			String statusQueueName = ConfigurationManager.configuration.get("PE_Status_Queue_Name");
			String paymentWorkBasketName =ConfigurationManager.configuration.get("WorkBasket_Payment_Name");
			String paymentQueueName = ConfigurationManager.configuration.get("PE_Payment_Queue_Name");
			String workItemUpdatedProperty = ConfigurationManager.configuration.get("WorkItem_Updated_Property");
			String dispatchingStatus = ConfigurationManager.configuration.get("Dispatching_Status");
			String dispatchingPayment= ConfigurationManager.configuration.get("Dispatching_Payment");
 			
			
			
/*			String filterStatusValue = ConnectionManager.myResources
					.getString("Filter_Status_value");
			String filterPaymentStatusValue = ConnectionManager.myResources
					.getString("Filer_PaymentStatus_Value");
			String statusPrm = ConnectionManager.myResources
					.getString("WorkItem_Updated_Property");
*/
			System.out.println("Configration Loaded Successfully !");
			// open PE & DB Connections
			System.out.println("Connecting to the ProcessEngine... ");
			VWSession peSession = connectionManager.getVWSession();
			System.out.println("Connected to ProcessEngine Server ["
					+ peSession.getServerName() + "]");
			System.out.println("Connecting to Database...");
			Connection dbConnection = connectionManager.getDBConnection();
			System.out.println("Database is Connected");

			// intialization

			VWStepElement workItem = null;
			DBOperations dbOperations = new DBOperations();
			EcmUtils ecmUtils = new EcmUtils();
			HashMap<String, Object> updatedProperties = new HashMap<String, Object>();

			// Logical Behavior for checkStatus Step
			PEOperations peOperations = new PEOperations();

			System.out.println("Fetching WorkQueue in checkStaus Step...");
			
			  VWWorkBasket workBasket = peOperations.fetchWorkBasket(
			  statusQueueName, statusWorkBasketName, peSession);
			

			/*VWQueueQuery query = peOperations.getQueryResult(statusPrm,
					filterStatusValue, peSession, statusQueueName);*/

			System.out
					.println("Queue has been fetched Sucessfully , and found ["
							+ workBasket.fetchCount() + "] WorkItems");

			System.out.println("Looping Over each WorkItem...");
			int index = 0;
			while (/*query.hasNext()*/ workBasket.hasNext() ) {
				System.out.println(">> Index [" + index + "]");
				index++;
				 workItem = (VWStepElement) workBasket.next();
				//workItem = (VWStepElement) query.next();
				String filterdWorkItemPropertyValue = (String) peOperations
						.getworkItemProperty(workItemProperty, workItem);
				System.out.println(">> WorkItem " + workItemProperty + " is "
						+ filterdWorkItemPropertyValue);
				String workItemStatus = dbOperations.getWorkItemStatus(
						dbConnection, filterdWorkItemPropertyValue);

				System.out.println(">> WorkItem Database Status is "
						+ workItemStatus);
				if (workItemStatus != null) {
					boolean eligableForStatusDispatching = ecmUtils
							.checkEligableForStatusDispatch(workItemStatus, dispatchingStatus);
					System.out.println(">>eligableForStatusDispatching "
							+ eligableForStatusDispatching);
					if (eligableForStatusDispatching) {
						updatedProperties.clear();
						
					System.out.println(">>Getting Guid");	 
					String	guidPropertyValue=peOperations
							.getworkItemGUIDProperty(GUIDPropertyName, workItem);
					System.out.println(">>Guid Value is "+guidPropertyValue);
					String amountPropertyValue=dbOperations.getWorkItemAmount(dbConnection, filterdWorkItemPropertyValue);
					System.out.println(">>The Amount is "+amountPropertyValue);
					CEOperations ceOperations=new CEOperations();
					ceOperations.updateCaseFolderPropertyByID(guidPropertyValue, target_ObjectStorename, AmountPopertyName, amountPropertyValue);
					
						
						/*updatedProperties.put(workItemUpdatedProperty,
								workItemStatus);
						System.out.println(">> Updating WorkItem Property As("
								+ updatedProperties.toString() + ")");
						peOperations.updateWorkItemProperties(workItem,
								updatedProperties);*/
						System.out.println(">> WorkItem Property Updated");
						System.out.println(">> Dispatching WorkItem..");
						peOperations.dispatchWithResponse(workItem);
						System.out.println(">> WorkItem Dispatched !");
					}
				}
			}

			// Logical Behavior for checkPayment Step
			System.out.println("Fetching WorkQueue in checkPayment Step...");

			workBasket =peOperations.fetchWorkBasket(paymentQueueName,paymentWorkBasketName,peSession);
			/*query = peOperations.getQueryResult(statusPrm,
					filterPaymentStatusValue, peSession, paymentQueueName);*/

			System.out
					.println("Queue has been fetched Sucessfully , and found ["
							+ workBasket.fetchCount() + "] WorkItems");
			System.out.println("Looping Over each WorkItem...");
			index = 0;
			while (/*query.hasNext() */ workBasket.hasNext()) {
				System.out.println(">> Index [" + index + "]");
				index++;
				 workItem = (VWStepElement) workBasket.next();
				//workItem = (VWStepElement) query.next();
				String filterdWorkItemPropertyValue = (String) peOperations
						.getworkItemProperty(workItemProperty, workItem);
				String workItemStatus = dbOperations.getWorkItemPaymentStatus(
						dbConnection, filterdWorkItemPropertyValue);

				System.out.println(">> WorkItem Database Status is "
						+ workItemStatus);

				if (workItemStatus != null) {
					boolean eligableForPaymentDispatching = ecmUtils
							.checkEligableForPaymentDispatch(workItemStatus,dispatchingPayment);

					System.out.println(">>eligableForPaymentDispatching "
							+ eligableForPaymentDispatching);

					if (eligableForPaymentDispatching) {

						updatedProperties.clear();
						updatedProperties.put(workItemUpdatedProperty,
								workItemStatus);
						System.out.println(">> Updating WorkItem Property As("
								+ updatedProperties.toString() + ")");
						//peOperations.updateWorkItemProperties(workItem,updatedProperties);
						System.out.println(">> WorkItem Property Updated");
						System.out.println(">> Dispatching WorkItem..");
						peOperations.dispatchWithResponse(workItem);
						System.out.println(">> WorkItem Dispatched !");
					}
				}
			}

			//

			// closing Connections
			dbConnection.close();

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

}
