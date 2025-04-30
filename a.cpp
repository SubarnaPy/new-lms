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
