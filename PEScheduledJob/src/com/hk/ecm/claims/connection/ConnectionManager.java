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
import com.filenet.api.core.Domain;
import com.filenet.api.core.Factory;
import com.filenet.api.util.UserContext;

import filenet.vw.api.VWSession;

public class ConnectionManager {
	public static ResourceBundle myResources = ResourceBundle
			.getBundle("com.hk.ecm.claims.config.Configuration_File");
	private static DataSource dataSource = null;

	public Connection getFNConnection() {

		String fnURL = myResources.getString("FN_URL");
		String userName = myResources.getString("User_Name");
		String password = myResources.getString("Password");
		String stanza = myResources.getString("Stanza");

		Connection conn = Factory.Connection.getConnection(fnURL);
		Subject subject = UserContext.createSubject(conn, userName, password,
				stanza);
		UserContext.get().pushSubject(subject);
		return conn;

	}

	public VWSession getVWSession() {

		String fnURL = myResources.getString("FN_URL");
		String userName = myResources.getString("User_Name");
		String password = myResources.getString("Password");
		String connectionPoint = myResources.getString("Connection_Point");

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
		String dataSourceName = myResources.getString("DB_JNDI");
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
		Connection conn = connectionManager.getFNConnection();

		Domain domain = Factory.Domain.fetchInstance(conn, null, null);
		System.out.println("Domain: " + domain.get_Name());
		VWSession session=connectionManager.getVWSession();

	}

}
