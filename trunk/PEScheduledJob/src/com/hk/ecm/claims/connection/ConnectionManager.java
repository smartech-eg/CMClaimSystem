package com.hk.ecm.claims.connection;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ResourceBundle;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.security.auth.Subject;
import javax.sql.DataSource;

import com.filenet.api.core.Connection;
import com.filenet.api.core.Factory;
import com.filenet.api.util.UserContext;
import com.hk.ecm.claims.utils.ConfigurationManager;

import filenet.vw.api.VWSession;

public class ConnectionManager {
	public static ResourceBundle myResources = ResourceBundle
			.getBundle("com.hk.ecm.claims.config.Configuration_File");
	private static DataSource dataSource = null;

	public Connection getFNConnection() {

		String fnURL = ConfigurationManager.configuration.get("FN_URL");
		String userName = ConfigurationManager.configuration.get("User_Name");
		String password =ConfigurationManager.configuration.get("Password");
		String stanza = ConfigurationManager.configuration.get("Stanza");

		Connection conn = Factory.Connection.getConnection(fnURL);
		Subject subject = UserContext.createSubject(conn, userName, password,
				stanza);
		UserContext.get().pushSubject(subject);
		return conn;

	}
	
	public Connection getFNConnectionUAT() {

		String fnURL = "http://192.168.50.58:9081/wsi/FNCEWS40SOAP";
		String userName = "fnceadmin";
		String password ="P@ssw0rd";
		String stanza = "FileNetP8WSI";

		Connection conn = Factory.Connection.getConnection(fnURL);
		Subject subject = UserContext.createSubject(conn, userName, password,
				stanza);
		UserContext.get().pushSubject(subject);
		return conn;

	}

	public VWSession getVWSession() {

		String fnURL = ConfigurationManager.configuration.get("FN_URL");
		String userName = ConfigurationManager.configuration.get("User_Name");
		String password = ConfigurationManager.configuration.get("Password");
		String connectionPoint = ConfigurationManager.configuration.get("Connection_Point");

		VWSession vwSession = new VWSession();
		vwSession.setBootstrapCEURI(fnURL);
		try {
			vwSession.logon(userName, password, connectionPoint);
		} catch (Exception e) {
			e.printStackTrace();
		}

		//System.out.println(vwSession.getServerName());
	     System.out.println("is Logged in:" + vwSession.isLoggedOn());
		return vwSession;
	}
	
	public VWSession getVWSessionTest() {

		String fnURL = "http://192.168.50.58:9081/wsi/FNCEWS40MTOM";
		String userName = "fnceadmin";
		String password ="P@ssw0rd";
		String stanza = "FileNetP8WSI";
        String connectionPoint="CM_CP";

		VWSession vwSession = new VWSession();
		vwSession.setBootstrapCEURI(fnURL);
		try {
			vwSession.logon(userName, password, connectionPoint);
		} catch (Exception e) {
			e.printStackTrace();
		}

		//System.out.println(vwSession.getServerName());
	     System.out.println("is Logged in:" + vwSession.isLoggedOn());
		return vwSession;
	}

	public java.sql.Connection getDBConnection() {
		String dataSourceName = ConnectionManager.myResources.getString("DB_JNDI");
		java.sql.Connection dbConnection = null;
		try {
			if (dataSource == null) {
				Context ctx = new InitialContext();
				dataSource = (DataSource) ctx.lookup(dataSourceName);
			}

			dbConnection = dataSource.getConnection();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return dbConnection;
	}

	/**
	 * Closes the Database {@link Connection} object quietly and logs the
	 * {@link SQLException} that might get thrown.
	 * 
	 * @param Connection
	 *            is an Opened DataBase Connection
	 */
	public static void closeConnection(java.sql.Connection connection) {
		try {
			if (connection != null && !connection.isClosed()) {
				connection.close();
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}

	}

	/**
	 * Closes a {@link ResultSet} object quietly and logs the
	 * {@link SQLException} that might get thrown.
	 * 
	 * @param resultSet
	 *            is the Database ResultSet of the fetched data from the
	 *            DataBase
	 */
	public static void closeResource(ResultSet resultSet) {
		try {
			if (resultSet != null && !resultSet.isClosed()) {
				resultSet.close();
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Closes a {@link Statement} object quietly and logs the
	 * {@link SQLException} that might get thrown.
	 * 
	 * @param statement
	 *            is the Database Statement that used to fetch the data from the
	 *            Database
	 */
	public static void closeResource(Statement statement) {
		try {
			if (statement != null && !statement.isClosed()) {
				statement.close();
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}

	}

	public static void main(String[] args) {
		// TODO Auto-generated method stub

		ConnectionManager connectionManager = new ConnectionManager();
		/*	Connection conn = connectionManager.getFNConnectionUAT();

		Domain domain = Factory.Domain.fetchInstance(conn, null, null);
		System.out.println("Domain: " + domain.get_Name());*/
		VWSession session=connectionManager.getVWSessionTest();

	}

}
