# ITmanagementProject
Our project is an IT Management system that allows for a company to configure and update devices remotely.
The company will be providing updates such as firmware updates, security updates, and bug fixes.
We will also be providing email advertisements to our clients and provide OTA diagnostics from the devices. 
The project will attempt to will do say in a way that it can be done securely and efficiently with as little security flaws as possible. 

For the Application and Transport layer protocols:

WebSocket seems to be the go to when dealing with something like firmware and security updates , it is important that connections and communication between client and server are handled in real time. 
In combination with WebSocket, TCP will be our transport layer protocol. 
By using TCP, we ensure a certain level of security as well as reliability.

Application architecture, number of hosts:

We will use a client-server type architecture for our project, where multiple devices can connect to a central server. 
Our project will include 3 hosts(one for each device, not necessarily a hard limit though). 
One to act as the server, and two to act as clients. 
The server will hold information about device data and update history. 
This will be mainly done through object orientated programming. 

Workflow of host:

First one of the hosts will run the application becoming the designated server. 
This host will establish the WebSocket and begin listening for clients. 
Clients connect using WebSocket and the devices will authenticate themselves some way upon connecting. 
Devices can create a connection request with information of their hardware. 
Hosts can view these requests and open up communication if the device has a special key authenticating themselves. 
There will be on the client specifying what kind of service they will need to have in order to receive proper service. 
After a connection has been made the server will begin to update the devices that are listed and will begin to send out what is needed by the client. 
The server will also be sending emails to clients when updates are not being sent. 

