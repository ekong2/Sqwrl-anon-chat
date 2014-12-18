package edu.jhu.cs.oosegroup5.fbanonchat.client;

/**
 * A chat message object that has the contents of a single message
 * 
 * @author johnlee
 *
 */
public abstract class ChatMessage {
	/**
	 * The contents of the message
	 */
	protected String message;
	/**
	 * The user that sent this message
	 */
	protected ChatUser sender;
	/**
	 * The user that received this message
	 */
	protected ChatUser receiver;

	/**
	 * Gets the string contents of the message
	 * 
	 * @return The message
	 */
	public abstract String getMessage();

	/**
	 * Gets the user object that sent the message
	 * 
	 * @return
	 */
	public abstract ChatUser getSender();

	/**
	 * Gets the user object that received the message
	 * 
	 * @return
	 */
	public abstract ChatUser getReceiver();

	/**
	 * Sets the string contents of the message
	 * 
	 */
	public abstract void setMessage(String message);

	/**
	 * Sets the user object that sent the message
	 * 
	 * @return
	 */
	public abstract void setSender(ChatUser sender);

	/**
	 * Sets the user object that received the message
	 * 
	 * @return
	 */
	public abstract void getReceiver(ChatUser receiver);
}
