package com.hk.ecm.claims.pe;

import java.util.ArrayList;
import java.util.HashMap;

import com.filenet.api.core.Connection;
import com.filenet.api.core.Domain;
import com.filenet.api.core.Factory;
import com.hk.ecm.claims.connection.ConnectionManager;
import com.hk.ecm.claims.db.DBOperations;
import com.hk.ecm.claims.utils.ConfigurationManager;

import filenet.vw.api.VWFetchType;
import filenet.vw.api.VWQueue;
import filenet.vw.api.VWQueueQuery;
import filenet.vw.api.VWRoster;
import filenet.vw.api.VWRosterElement;
import filenet.vw.api.VWRosterQuery;
import filenet.vw.api.VWSession;
import filenet.vw.api.VWStepElement;
import filenet.vw.api.VWWorkBasket;
import filenet.vw.api.VWWorkObject;

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
		workItem.doSave(true);

	}

	public void dispatchWithResponse(VWStepElement workItem) {
		workItem.doLock(true);
		workItem.doDispatch();
	}

	public Object getworkItemProperty(String propertyName,
			VWStepElement workItem) {
		return workItem.getParameterValue(propertyName);

	}

	public String getworkItemGUIDProperty(String propertyName,
			VWStepElement workItem) {

		String[] guid = (String[]) workItem.getParameterValue(propertyName);
		return guid[0];

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
		/*
		 * String [] queues =session.getQueueNames(true);
		 * 
		 * 
		 * for (int i = 0; i < queues.length; i++) {
		 * System.out.println(queues[i]); }
		 * 
		 * VWQueue vwQueue= session.getQueue("GLCL_ClaimAccessorA");
		 * 
		 * 
		 * 
		 * VWWorkBasket[] workBasket = vwQueue.fetchWorkBaskets();
		 * System.out.println("+"+workBasket.length); for (int i = 0; i <
		 * workBasket.length; i++) {
		 * System.out.println(workBasket[i].getName()); }
		 */
		VWWorkBasket workbasket = operations.fetchWorkBasket(
				"GLCL_CheckStatus", "CheckStatus", session);
		System.out.println(workbasket.fetchCount());

		VWStepElement workItem = (VWStepElement) workbasket.next();
		String[] prams = workItem.getParameterNames();
		for (int i = 0; i < prams.length; i++) {
			System.out.println("**" + prams[i]);

		}

		// operations.dispatchWithResponse(workItem);
		// workItem.doSave(false);

		// workItem.doDispatch();
		// operations.dispatchWithResponse(workItem);
		// connectionManager.getVWSession();

		// System.out.println(workbasket.fetchCount());
		/*
		 * while(workbasket.hasNext()) { VWStepElement workItem =(VWStepElement)
		 * workbasket.next(); String [] prams=workItem.getParameterNames(); for
		 * (int i = 0; i < prams.length; i++) {
		 * //System.out.println("**"+prams[i]);
		 * 
		 * } }
		 */

	}

	public VWRosterQuery getRosterQueryResult(String PrmName, String PramValue,
			VWRoster vwRoster) {

		int queryFlags = VWRoster.QUERY_MIN_VALUES_INCLUSIVE
				+ VWRoster.QUERY_MAX_VALUES_INCLUSIVE;
		int queryType = VWFetchType.FETCH_TYPE_ROSTER_ELEMENT;
		String queryFilter = PrmName + " ='" + PramValue + "'";
		VWRosterQuery rosQuery = vwRoster.createQuery(null, null, null,
				queryFlags, queryFilter, null, queryType);

		return rosQuery;
	}

	public void terminateWorkObjectsWithCaseIds(VWSession vwSession,
			ArrayList<String> caseIDs, String caseIDAttr, String rosterName,java.sql.Connection dbConnection) {
       DBOperations  dbOperations=new DBOperations();
       String terminateColName= ConfigurationManager.configuration.get("Terminate_Col_Name");
		String caseIDColName =ConfigurationManager.configuration.get("caseID_Col_Name");
       VWRoster vwros = vwSession.getRoster(rosterName);
		for (int i = 0; i < caseIDs.size(); i++) {

			
			
			System.out.println("Fetching Workitems  with caseIDAttr = "
					+ caseIDs.get(i));
			VWRosterQuery query = getRosterQueryResult(caseIDAttr,
					caseIDs.get(i), vwros);
			
			VWRosterElement workItem = null;

			while (query.hasNext()) {

				workItem = (VWRosterElement) query.next();

				VWWorkObject vwWorkObject = workItem
						.fetchWorkObject(true, true);
				System.out.println(">>workItem fetchted");
				vwWorkObject.doTerminate();
				System.out.println(">>workItem terminated");
				dbOperations.updateTerminateStatus(dbConnection, terminateColName, caseIDColName, caseIDs.get(i));
			     System.out.println("DB Status updated");
			}
		}

	}

}
