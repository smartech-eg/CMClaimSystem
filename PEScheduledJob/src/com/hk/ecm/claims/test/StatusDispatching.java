package com.hk.ecm.claims.test;

import java.io.IOException;
import java.sql.Connection;
import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.hk.ecm.claims.connection.ConnectionManager;
import com.hk.ecm.claims.db.DBOperations;
import com.hk.ecm.claims.pe.PEOperations;
import com.hk.ecm.claims.utils.ConfigurationManager;
import com.hk.ecm.claims.utils.EcmUtils;

import filenet.vw.api.VWSession;
import filenet.vw.api.VWStepElement;
import filenet.vw.api.VWWorkBasket;

/**
 * Servlet implementation class StatusDispatching
 */

public class StatusDispatching extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public StatusDispatching() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		try {
			ConnectionManager connectionManager = new ConnectionManager();
			// load Configration
			System.out.println("Loading Configrations..");
			/*String workItemProperty = ConnectionManager.myResources
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
						updatedProperties.put(workItemUpdatedProperty,
								workItemStatus);
						System.out.println(">> Updating WorkItem Property As("
								+ updatedProperties.toString() + ")");
						peOperations.updateWorkItemProperties(workItem,
								updatedProperties);
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
						peOperations.updateWorkItemProperties(workItem,
								updatedProperties);
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
