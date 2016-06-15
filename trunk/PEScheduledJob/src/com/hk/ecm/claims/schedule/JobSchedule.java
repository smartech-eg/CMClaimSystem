package com.hk.ecm.claims.schedule;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.quartz.CronScheduleBuilder;
import org.quartz.CronTrigger;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SchedulerFactory;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

import com.hk.ecm.claims.db.DBOperations;
import com.hk.ecm.claims.utils.ConfigurationManager;

public class JobSchedule implements ServletContextListener {

	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

 	public void contextDestroyed(ServletContextEvent arg0) {
 		SchedulerFactory schFactory = new StdSchedulerFactory();
 		Scheduler scheduler=null;
		try {
			scheduler = schFactory.getScheduler();
			if (scheduler.isStarted()) {

	 			scheduler.shutdown();
	 			System.out.println("Job ShutDown");

	 			}
		} catch (SchedulerException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
 		
	}

	 
	public void contextInitialized(ServletContextEvent arg0) {
		System.out.println("Configuration : ");
		System.out.println(ConfigurationManager.configuration.toString());
		ConfigurationManager.configuration=DBOperations.loadConfigurations();
		String timerExpression = ConfigurationManager.configuration.get("Timer_Expression");
		
		CronTrigger StatusDispatchingCronTrigger = TriggerBuilder
				.newTrigger()
				.withIdentity("StatusDispatchingTrigger", "StatusDispatchingGroup")
				.withSchedule(CronScheduleBuilder.cronSchedule(timerExpression))
				.build();
		JobDetail StatusDispatchingJob = JobBuilder.newJob(PEStatusDispatchingJob.class)
				.withIdentity("PEStatusDispatchingJob").build();

		SchedulerFactory schFactory = new StdSchedulerFactory();
		Scheduler sch = null;
		try {
			sch = schFactory.getScheduler();
			sch.scheduleJob(StatusDispatchingJob, StatusDispatchingCronTrigger);
			sch.start();
		} catch (SchedulerException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	

	}
}