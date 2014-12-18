package edu.jhu.cs.oosegroup5.fbanonchat.client;

import java.util.List;

/**
 * Describes a chat session between two users.
 * 
 * @author johnlee
 *
 */
public abstract class ChatSession {

	/**
	 * A boolean that describes whether the session is revealed.
	 */
	protected boolean revealed;
	
	/**
	 * The users in the chat session
	 */
	protected List<ChatUser> users;

	/**
	 * The messages in this session
	 */
	protected List<ChatMessage> messages;
	/**
	 * Adds two users to this chat session
	 * 
	 * @param user1
	 * @param user2
	 */
	public abstract void addUsers(ChatUser user1, ChatUser user2);

	/**
	 * Sends the messages between server and client
	 */
	public abstract void updateMessages();

	/**
	 * When both users choose to reveal their identities, the chat session will
	 * be set to a revealed chat.
	 * 
	 * @param user1choice
	 * @param user2choice
	 * @return
	 */
	public abstract boolean revealUsers(boolean user1choice, boolean user2choice);

	/**
	 * Ends the current chat session.
	 */
	public abstract void endChat();
}
