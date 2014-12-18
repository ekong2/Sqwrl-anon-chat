package edu.jhu.cs.oosegroup5.fbanonchat.server;


/**
 * Socket listener for a connection with a client
 * 
 * @author johnlee
 *
 */
public interface ChatSocketListener {

	/**
	 * Listens for a socket from a client
	 */
	public void listen();
}
