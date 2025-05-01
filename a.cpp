#include <iostream>
#include <vector>
#include <queue>
#include <functional>

using namespace std;

int maxRevenue(vector<int>& quantity, int m) {
    // Max heap to store item prices (equal to remaining quantity)
    priority_queue<int> maxHeap;

    // Push all quantities into the heap
    for (int q : quantity) {
        maxHeap.push(q);
    }

    int revenue = 0;

    // Sell items to m customers
    for (int i = 0; i < m; ++i) {
        int top = maxHeap.top();
        maxHeap.pop();
        revenue += top;

        // Decrease the quantity by 1 and push it back if it's still > 0
        if (top - 1 > 0) {
            maxHeap.push(top - 1);
        }
    }

    return revenue;
}

int main() {
    int n = 3, m = 4;
    vector<int> quantity = {1, 2, 4};  // Quantity of each item type

    int maxRev = maxRevenue(quantity, m);
    cout << "Maximum revenue: " << maxRev << endl;

    return 0;
}




**From the First Image:**

1. What is blockchain?
2. List the characteristics of blockchain technology.
3. List five different scenarios where blockchain can be helpful.
4. Prepare a short note on how is blockchain different from bitcoin.
5. Prepare a one-page point of view on "Challenges that discourage organizations to collaborate in the current landscape and how blockchain can help circumvent these challenges."
6. Identify different blockchain platforms and create a point of view on their strengths and weaknesses.
7. What are key features of Blockchain 1.0 networks?
8. What are key features of Blockchain 2.0 networks?
9. What are key features of Blockchain 3.0 networks?
10. Define smart contracts in context of blockchain.
11. How are decentralized applications different from traditional computer applications?
12. Explain the different types of consortia in blockchain world, along with their relevance.
13. Explain the different classifications of blockchain network.
14. Elaborate on the different players in blockchain ecosystem.
15. Explore the blockchain networks in each of the stages of blockchain evolution.
16. Prepare a point of view on blockchain consortia that support any two business domains of your choice.
17. Find the three blockchain networks and platforms for various network types.

**From the Second Image (Essay-type Questions):**

1. Write an essay on the evolution of blockchain.
2. Differentiate between traditional and blockchain transactions using suitable examples.
3. Explain Peer-to-Peer Network, Public Key Cryptography and Distributed Consensus in detail.
4. In the digital world, trust relates to two questions: "Are you who you say you are?" and "Do you have the rights to do what you want to do?" Explain blockchain's respect to the above two aspects.
5. Explain ledger and wallet in detail.
6. What is hash in a blockchain? What are the key characteristics of Hash?
7. Discuss the concept of mining in blockchain in detail.
8. Discuss the concept of block in blockchain in detail.
9. Explain blockchain ecosystem in detail.
10. Discuss the pros and cons of blockchain in detail.

**From the Third Image (Essay-type Questions):**

1. Write an essay on the concept of Centralization and Decentralization in detail.
2. Discuss DLT concepts of Blockchain in detail along with the benefits.
3. What is public blockchain? What are the features and drawbacks of public blockchain?
4. What is private blockchain? What are the features and drawbacks of private blockchain?
5. What are the distinct features of a public blockchain?
6. What are the distinct features of a private blockchain?
7. List the challenges of a private blockchain.
8. What is consortium blockchain? What are the features and drawbacks of consortium blockchain?
9. What is hybrid blockchain? What are the features and drawbacks of hybrid blockchain?
10. Compare Public, Private, Consortium and Hybrid blockchain.
11. Discuss RAFT algorithm.

**From the Fourth Image (Short and Long Answer Questions):**

**SHORT ANSWER QUESTIONS:**

1. What do you understand by timestamping?
2. How many types of blockchains do you know? Name them.
3. What is a permissionless blockchain?
4. How you can create a digital signature?
5. Define hash function.
6. What is a Merkle tree?
7. What is distributed ledger technology?
8. What is "block" in blockchain?
9. How you define consilience and why it is important in blockchain?
10. What is a payment system?
11. What are the pros and cons of centralized systems?
12. What do you understand by disintermediation in blockchain?
13. What are the pros and cons of decentralized systems?

**LONG ANSWER QUESTIONS:**

1. Explain with the help of a diagram the different types of blockchains.
2. Explain how blockchain supports digital currency that does not require central authority.
3. Enumerate five characteristics of centralized systems.
4. Enumerate five characteristics of decentralized systems.

**From the Fifth Image (Short and Long Answer Questions):**

**SHORT ANSWER QUESTIONS:**

1. Why should hash function be collision resistant?
2. How would you define avalanche effect in cryptography? Why is it important?
3. What do you understand by mathematical hard problem in cryptography?
4. Compare the technical properties of MD5 and SHA1.
5. What basic arithmetical and logical functions are used in SHA1?
6. What is sponge function in SHA3?
7. What is distributed hash table? Where are they used?
8. Differentiate between consistent and rendezvous hashing.
9. What is a Merkle tree?
10. What is cryptography?
11. What are two types of cryptography?
12. How many keys are used in symmetric cryptography?
13. What is the main drawback of symmetric cryptography?
14. What is the difference between symmetric and public key cryptography?
15. What algorithms are used in asymmetric encryption?
16. How does asymmetric key encryption work?
17. How does a stream cipher work?
18. Which is faster - block cipher or stream cipher?

**LONG ANSWER QUESTIONS:**

1. Consider that $H(x)$ is a collision-resistant hash function that maps a message of arbitrary bit length into an $n$-bit hash value. Prove that for a 1-bit equal to $s_1$, $H(x_1)$ is not equal to $H(x_2)$. Explain your answer.
2. What are the challenges of symmetric key cryptography? List them by taking at least two symmetric key algorithms.
3. Prove mathematically that asymmetric key cryptography is still safe even if one key of sufficient length is shared in the public domain.

**From the Sixth Image (2 marks questions):**

* "Blockchain and Bitcoin are not the same". Justify.
* Which block does not contain any previous block hash code and why? Justify.
* What are the common features in different types of blockchains?
* Explain what do you mean by double spending.

**From the Seventh Image (Short Answer and 5 marks questions):**

**Short Answer Questions:**

* What are the characteristics of a blockchain ledger?
* What is nonce in blockchain?
* What do you mean by the term peer-to-peer network?
* What is a mining pool?
* Who were the founders of Bitcoin and Ethereum?
* What do you mean by a distributed system and what is its utility?
* Differentiate between a full node and a partial node.
* "Blockchain is trustless". Justify.
* Why do we need blockchain in banking?
* "Blockchain is a special type of linked list". Justify.

**5 marks questions:**

* Differentiate between centralized and decentralized systems.
* Discuss on the "first generation of blockchain".

**From the Eighth Image (10 marks questions):**

* Discuss about the different components of any Blockchain network.
* Justify the following statements:
    * i) Blockchain is a digital ledger
    * ii) Blockchain is cryptographically linked
    * iii) Tamper-resistant log of events, transactions, time-stamped data
* Give the step-by-step representation of a Blockchain Transaction.
* What is the significance of Merkle root?
* Discuss about the pros and cons of blockchain.
* Discuss how Blockchain can be used in Supply Chain.
* What is blockchain? Discuss on the evolution/development of blockchain.
Simply copy this text and paste it into your preferred document editor, and then you should be able to save it as a PDF. Let me know if you need any adjustments to this text!






